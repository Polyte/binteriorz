import { createHash } from 'node:crypto';
import { addNotification, getValue, setValue, type AppEnv } from './app-data';

export interface Env extends AppEnv {
  PAYFAST_ORDERS: KVNamespace;
  PAYFAST_MODE: string;
  PAYFAST_MERCHANT_ID: string;
  PAYFAST_MERCHANT_KEY: string;
  PAYFAST_PASSPHRASE?: string;
}

export interface PayFastOrder {
  orderId: string;
  items: Array<{ id: string; sku: string; name: string; price: number; quantity: number; image: string }>;
  total: number;
  customerInfo: { firstName: string; lastName: string; email: string; phone: string; address: string; city: string; postalCode: string };
  status: 'pending_payment' | 'confirmed' | 'cancelled';
  paymentMethod: 'payfast';
  createdAt: string;
  pfPaymentId?: string;
}

export const isSandbox = (env: Env) => (env.PAYFAST_MODE || 'sandbox').toLowerCase() !== 'live';
export const paymentUrl = (env: Env) => isSandbox(env)
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

export function encode(value: string): string {
  return encodeURIComponent(value.trim()).replace(/[!'()*~]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`).replace(/%20/g, '+');
}

export function signature(data: Record<string, string>, passphrase?: string, includeBlank = false): string {
  const input = Object.entries(data)
    .filter(([, value]) => includeBlank || value !== '')
    .map(([key, value]) => `${key}=${encode(value)}`).join('&');
  const signed = passphrase ? `${input}&passphrase=${encode(passphrase)}` : input;
  return createHash('md5').update(signed).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) diff |= (left[i] || 0) ^ (right[i] || 0);
  return diff === 0;
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function payFastFields(body: Record<string, unknown>, order: PayFastOrder, env: Env, origin: string) {
  const itemDescription = order.items.map(i => i.name).join(', ').slice(0, 255);
  const fields: Record<string, string> = {
    merchant_id: env.PAYFAST_MERCHANT_ID,
    merchant_key: env.PAYFAST_MERCHANT_KEY,
    return_url: `${origin}/thank-you?payfast=1`,
    cancel_url: `${origin}/checkout`,
    notify_url: `${origin}/api/payfast/notify`,
    name_first: order.customerInfo.firstName,
    name_last: order.customerInfo.lastName,
    email_address: order.customerInfo.email,
    cell_number: order.customerInfo.phone.replace(/[^0-9]/g, ''),
    m_payment_id: order.orderId,
    amount: order.total.toFixed(2),
    item_name: `B-Interiors Order ${order.orderId}`,
    item_description: itemDescription,
  };
  for (const key of Object.keys(fields)) if (!fields[key]) delete fields[key];
  fields.signature = signature(fields, env.PAYFAST_PASSPHRASE);
  return fields;
}

const allowedPayFastRanges = [
  ['197.97.145.144', 28], ['41.74.179.192', 27], ['102.216.36.0', 28],
  ['102.216.36.128', 28], ['144.126.193.139', 32],
] as const;

function ipv4Number(ip: string): number | null {
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
}

export function isAllowedPayFastIp(ip: string): boolean {
  const candidate = ipv4Number(ip);
  if (candidate === null) return false;
  return allowedPayFastRanges.some(([network, bits]) => {
    const base = ipv4Number(network)!;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (candidate & mask) === (base & mask);
  });
}

export async function validateNotification(fields: Record<string, string>, env: Env): Promise<boolean> {
  const validationUrl = isSandbox(env)
    ? 'https://sandbox.payfast.co.za/eng/query/validate'
    : 'https://www.payfast.co.za/eng/query/validate';
  const response = await fetch(validationUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
    signal: AbortSignal.timeout(10000),
  });
  return response.ok && (await response.text()).trim() === 'VALID';
}

export { getValue, setValue, addNotification };
