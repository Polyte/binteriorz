import type { Env, PayFastOrder } from '../../../_lib/payfast';
import { json } from '../../../_lib/payfast';

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const order = await env.PAYFAST_ORDERS.get(String(params.orderId));
  if (!order) return json({ error: 'Order not found' }, 404);
  const data = JSON.parse(order) as PayFastOrder;
  return json({ orderId: data.orderId, status: data.status, total: data.total, items: data.items, customerName: `${data.customerInfo.firstName} ${data.customerInfo.lastName}`.trim(), email: data.customerInfo.email, paymentMethod: data.paymentMethod, createdAt: data.createdAt });
};
