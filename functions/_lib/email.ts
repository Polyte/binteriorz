import type { AppEnv } from './app-data';

export async function sendEmail(env: AppEnv, to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !to) return false;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to, subject, html }),
    });
    if (!response.ok) console.error('Transactional email delivery failed', response.status);
    return response.ok;
  } catch {
    console.error('Transactional email delivery could not reach the email provider');
    return false;
  }
}

export const escapeHtml = (value: unknown) => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));

export function orderConfirmation(order: any) {
  const rows = (order.items || []).map((item: any) => `<tr><td style="padding:12px 0;border-bottom:1px solid #eee">${escapeHtml(item.name)} × ${Number(item.quantity || 1)}</td><td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right">R ${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td></tr>`).join('');
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#171717"><header style="background:#171717;color:white;padding:28px;text-align:center;letter-spacing:.3em">B INTERIOR DESIGNZ</header><main style="padding:32px"><h1 style="font-weight:400">Order confirmed</h1><p>Thank you, ${escapeHtml(order.customerInfo?.firstName)}. Your payment has been confirmed.</p><p>Order reference: <strong>${escapeHtml(order.orderId)}</strong></p><table style="width:100%;border-collapse:collapse">${rows}</table><p style="text-align:right;font-size:18px"><strong>Total: R ${Number(order.total).toLocaleString()}</strong></p></main></div>`;
}
