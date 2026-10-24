import type { Env, PayFastOrder } from '../../_lib/payfast';
import { json, payFastFields, paymentUrl } from '../../_lib/payfast';
import { productList } from '../../_lib/app-data';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (!env.PAYFAST_MERCHANT_ID || !env.PAYFAST_MERCHANT_KEY) return json({ error: 'PayFast is not configured.' }, 503);
    const body = await request.json() as Record<string, any>;
    const items = body.items;
    const customer = body.customerInfo;
    if (!Array.isArray(items) || items.length < 1 || items.length > 50 || !customer || typeof customer !== 'object') return json({ error: 'Cart and customer details are required.' }, 400);
    const firstName = String(customer.firstName || '').trim();
    const lastName = String(customer.lastName || '').trim();
    const email = String(customer.email || '').trim();
    if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'A valid customer name and email are required.' }, 400);

    const products = await productList(env);
    const orderItems: PayFastOrder['items'] = [];
    let cents = 0;
    for (const item of items) {
      const id = String(item?.id || '').trim();
      const sku = String(item?.sku || item?.internalSku || '').trim().toLowerCase();
      const product = products.find(p => (id && String(p.id) === id) || (sku && String(p.sku || p.internalSku || '').toLowerCase() === sku));
      const quantity = Number(item?.quantity);
      const price = Number(product?.price);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 100 || !Number.isFinite(price) || price < 0) return json({ error: 'One or more cart items are invalid or unavailable.' }, 400);
      cents += Math.round(price * 100) * quantity;
      orderItems.push({ id: String(product.id), sku: String(product.sku || product.internalSku || ''), name: String(product.name || 'Product'), price: Math.round(price * 100) / 100, quantity, image: String(product.image || product.mainImage || '') });
    }
    if (!Number.isFinite(Number(body.total)) || Math.round(Number(body.total) * 100) !== cents || cents <= 0) return json({ error: 'Cart total changed. Refresh your cart and try again.' }, 400);

    const order: PayFastOrder = {
      orderId: `BI-${crypto.randomUUID()}`,
      items: orderItems,
      total: cents / 100,
      customerInfo: { firstName, lastName, email, phone: String(customer.phone || '').trim().slice(0, 40), address: String(customer.address || '').trim().slice(0, 255), city: String(customer.city || '').trim().slice(0, 120), postalCode: String(customer.postalCode || '').trim().slice(0, 30) },
      status: 'pending_payment', paymentMethod: 'payfast', createdAt: new Date().toISOString(),
    };
    await env.PAYFAST_ORDERS.put(order.orderId, JSON.stringify(order), { expirationTtl: 60 * 60 * 24 * 90 });
    const origin = new URL(request.url).origin;
    return json({ orderId: order.orderId, paymentUrl: paymentUrl(env), formData: payFastFields(body, order, env, origin) });
  } catch (error) {
    console.error('PayFast payment generation failed', error);
    return json({ error: 'Unable to initialize PayFast payment.' }, 500);
  }
};
