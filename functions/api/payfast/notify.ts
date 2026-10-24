import type { Env, PayFastOrder } from '../../_lib/payfast';
import { addNotification, getValue, isAllowedPayFastIp, safeEqual, setValue, signature, validateNotification } from '../../_lib/payfast';
import { orderConfirmation, sendEmail } from '../../_lib/email';

const responseText = (text: string, status = 200) => new Response(text, { status, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const sourceIp = request.headers.get('cf-connecting-ip') || '';
    if (!isAllowedPayFastIp(sourceIp)) return responseText('INVALID_SOURCE', 403);
    const params = new URLSearchParams(await request.text());
    const fields: Record<string, string> = {};
    for (const [key, value] of params) {
      if (Object.hasOwn(fields, key)) return responseText('INVALID', 400);
      fields[key] = value;
    }
    const { signature: receivedSignature, m_payment_id: orderId, payment_status: status, pf_payment_id: paymentId, amount_gross: amount } = fields;
    if (!orderId || !receivedSignature || !env.PAYFAST_MERCHANT_ID || fields.merchant_id !== env.PAYFAST_MERCHANT_ID) return responseText('INVALID_MERCHANT', 400);
    const unsigned = { ...fields };
    delete unsigned.signature;
    const expected = signature(unsigned, env.PAYFAST_PASSPHRASE, true);
    if (!safeEqual(receivedSignature.toLowerCase(), expected)) return responseText('INVALID_SIGNATURE', 400);

    const serialized = await env.PAYFAST_ORDERS.get(orderId);
    if (!serialized) return responseText('ORDER_NOT_FOUND', 404);
    const order = JSON.parse(serialized) as PayFastOrder;
    if (status === 'COMPLETE') {
      const receivedCents = Math.round(Number(amount) * 100);
      if (!paymentId || !Number.isFinite(receivedCents) || Math.abs(receivedCents - Math.round(order.total * 100)) > 1) return responseText('INVALID_PAYMENT_DATA', 400);
      if (order.status === 'confirmed') return order.pfPaymentId === paymentId ? responseText('OK') : responseText('PAYMENT_CONFLICT', 409);
    }
    if (status !== 'COMPLETE' && status !== 'CANCELLED') return responseText('OK');
    if (!await validateNotification(fields, env)) return responseText('INVALID_SERVER_CONFIRMATION', 400);

    if (status === 'COMPLETE') {
      const confirmed: PayFastOrder = { ...order, status: 'confirmed', pfPaymentId: paymentId };
      await env.PAYFAST_ORDERS.put(orderId, JSON.stringify(confirmed), { expirationTtl: 60 * 60 * 24 * 90 });
      const orders = await getValue<any[]>(env, 'orders', []);
      await setValue(env, 'orders', [...orders.filter(item => item.orderId !== orderId), { ...confirmed, amountPaid: Number(amount), paidAt: new Date().toISOString() }]);
      await addNotification(env, 'order', 'PayFast Payment Confirmed', `Order ${orderId} paid via PayFast — R ${amount}`, 'orders', { orderId, amount });
      await sendEmail(env, confirmed.customerInfo.email, `Order Confirmed — ${orderId}`, orderConfirmation(confirmed));
      if (env.STORE_NOTIFICATION_EMAIL) await sendEmail(env, env.STORE_NOTIFICATION_EMAIL, `New order — ${orderId}`, orderConfirmation(confirmed));
    } else {
      await env.PAYFAST_ORDERS.put(orderId, JSON.stringify({ ...order, status: 'cancelled' }), { expirationTtl: 60 * 60 * 24 * 90 });
    }
    return responseText('OK');
  } catch (error) {
    console.error('PayFast notification processing failed', error);
    return responseText('ERROR', 500);
  }
};
