import type { AppEnv } from '../_lib/app-data';
import { addActivity, addNotification, currentUser, getValue, json, normalizeEmail, parseJson, productList, productResponse, requireAdmin, setValue, text } from '../_lib/app-data';
import { userFromRequest } from '../_lib/auth';
import { PRODUCT_CATALOGUE_VERSION } from '../../src/app/data/catalogue';
import { signup } from '../_lib/auth';
import { escapeHtml, sendEmail } from '../_lib/email';

const publicLists: Record<string, string> = {
  orders: 'orders', vendors: 'vendors', inquiries: 'inquiries', 'newsletter-subs': 'newsletter',
  'all-reviews': 'reviews', pages: 'pages', 'page-templates': 'page_templates', notifications: 'notifications',
  'activity-log': 'activity_log', 'admin-roles': 'admin_roles', discussions: 'discussions',
};

async function readList(env: AppEnv, key: string) { return getValue<any[]>(env, key, []); }
async function mutateList(env: AppEnv, key: string, updater: (items: any[]) => any[]) {
  const before = await readList(env, key);
  const after = updater(before);
  await setValue(env, key, after);
  return after;
}

export const onRequest: PagesFunction<AppEnv> = async ({ request, env }) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, '');
  const method = request.method.toUpperCase();
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const root = parts[0] || '';
  const id = parts[1] || '';
  const body = ['POST', 'PUT', 'PATCH'].includes(method) && request.headers.get('content-type')?.includes('application/json') ? await parseJson(request) : null;

  try {
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': url.origin, 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS' } });
    if (method === 'GET' && root === 'health') return json({ status: 'ok', provider: 'cloudflare' });
    if (method === 'GET' && root === 'products') return productResponse(env);
    if (method === 'GET' && root === 'media' && id === 'file' && parts[2]) {
      const record = (await readList(env, 'media')).find(item => item.id === parts[2]);
      if (!record) return text('Not found', 404);
      const object = await env.APP_MEDIA.get(record.storagePath);
      if (!object) return text('Not found', 404);
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(object.body, { headers });
    }
    if (method === 'POST' && root === 'signup') return signup({ request, env }, body);
    if (method === 'GET' && root === 'orders' && id === 'lookup' && parts[2]) {
      const order = (await readList(env, 'orders')).find((item: any) => item.orderId === parts[2]);
      if (!order) return json({ error: 'Order not found' }, 404);
      return json({ orderId: order.orderId, status: order.status, total: order.total, items: order.items, customerName: `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim(), email: order.customerInfo?.email || '', paymentMethod: order.paymentMethod || 'payfast', createdAt: order.createdAt });
    }
    if (method === 'GET' && root === 'homepage-content' && id === 'admin') {
      const user = await requireAdmin(request, env);
      if (!user) return json({ error: 'Unauthorized' }, 401);
      return json({ draft: await getValue(env, 'homepage_content_draft', {}), published: await getValue(env, 'homepage_content_published', {}), publishedAt: await getValue(env, 'homepage_published_at', null) });
    }
    if (method === 'GET' && root === 'homepage-content') return json(await getValue(env, 'homepage_content_published', {}));
    if (method === 'GET' && root === 'page' && id) {
      const page = (await readList(env, 'pages')).find((item: any) => item.slug === id && item.status === 'published');
      return page ? json(page) : json({ error: 'Page not found' }, 404);
    }
    if (method === 'GET' && root === 'discussions') return json(await readList(env, 'discussions'));
    if (method === 'GET' && root === 'reviews' && id) return json((await readList(env, 'reviews')).filter((review: any) => review.productId === id && review.status !== 'hidden'));
    if (method === 'GET' && root === 'news') return json(await getValue(env, 'news', []));

    if (method === 'POST' && root === 'inquiries') {
      if (!body) return json({ error: 'Invalid request body' }, 400);
      const inquiry = { ...body, id: crypto.randomUUID(), status: 'new', createdAt: new Date().toISOString() };
      await mutateList(env, 'inquiries', list => [...list, inquiry]);
      await addNotification(env, 'inquiry', 'New Consultation Request', `New inquiry from ${String(body.name || body.email || 'a visitor')}`, 'inquiries', { id: inquiry.id });
      if (env.STORE_NOTIFICATION_EMAIL) await sendEmail(env, env.STORE_NOTIFICATION_EMAIL, 'New B-Interiors consultation request', `<p>New enquiry from ${escapeHtml(body.name || 'a visitor')}.</p>`);
      return json({ success: true, id: inquiry.id }, 201);
    }
    if (method === 'POST' && root === 'newsletter') {
      const email = normalizeEmail(body?.email);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'A valid email is required.' }, 400);
      const subs = await readList(env, 'newsletter');
      if (!subs.some((entry: any) => normalizeEmail(entry.email) === email)) await setValue(env, 'newsletter', [...subs, { id: crypto.randomUUID(), email, preferences: body?.preferences || [], createdAt: new Date().toISOString() }]);
      return json({ success: true }, 201);
    }
    if (method === 'POST' && root === 'vendors' && id === 'apply') {
      if (!body) return json({ error: 'Invalid request body' }, 400);
      const vendor = { ...body, id: crypto.randomUUID(), status: 'pending', createdAt: new Date().toISOString() };
      await mutateList(env, 'vendors', list => [...list, vendor]);
      await addNotification(env, 'vendor', 'New Vendor Application', `New application from ${String(body.businessName || body.name || 'a vendor')}`, 'vendors', { id: vendor.id });
      return json({ success: true, id: vendor.id }, 201);
    }
    if (method === 'POST' && root === 'reviews') {
      if (!body || !body.productId || !body.rating) return json({ error: 'Product and rating are required.' }, 400);
      const review = { ...body, id: crypto.randomUUID(), status: 'pending', createdAt: new Date().toISOString() };
      await mutateList(env, 'reviews', list => [...list, review]);
      return json({ success: true, review }, 201);
    }
    if (method === 'POST' && root === 'discussions') {
      const user = await currentUser(request, env);
      if (!user) return json({ error: 'Unauthorized' }, 401);
      const discussion = { ...body, id: crypto.randomUUID(), userId: user.id, createdAt: new Date().toISOString() };
      await mutateList(env, 'discussions', list => [...list, discussion]);
      return json(discussion, 201);
    }
    if (method === 'GET' && root === 'my-orders') {
      const customer = await userFromRequest(request, env);
      if (!customer) return json({ error: 'Unauthorized' }, 401);
      const orders = await readList(env, 'orders');
      return json(orders.filter((order: any) => normalizeEmail(order.customerInfo?.email) === customer.email));
    }

    const user = await requireAdmin(request, env, root === 'admin-roles' ? 'owner' : 'editor');
    if (!user) return json({ error: 'Unauthorized' }, 401);

    if (method === 'GET' && root === 'products') return productResponse(env);
    if (method === 'GET' && root === 'orders' && !id) return json(await readList(env, 'orders'));
    if (method === 'GET' && root === 'vendors' && !id) return json(await readList(env, 'vendors'));
    if (method === 'GET' && root === 'inquiries') return json(await readList(env, 'inquiries'));
    if (method === 'GET' && root === 'newsletter-subs') return json(await readList(env, 'newsletter'));
    if (method === 'GET' && root === 'all-reviews') return json(await readList(env, 'reviews'));
    if (method === 'GET' && root === 'pages') return json(await readList(env, 'pages'));
    if (method === 'GET' && root === 'page-templates') return json(await readList(env, 'page_templates'));
    if (method === 'GET' && root === 'activity-log') return json(await readList(env, 'activity_log'));
    if (method === 'GET' && root === 'notifications') return json(await readList(env, 'notifications'));
    if (method === 'GET' && root === 'orders' && id === 'lookup') return json({ error: 'Order not found' }, 404);
    if (method === 'GET' && root === 'site-settings') return json(await getValue(env, 'site_settings', {}));
    if (method === 'GET' && root === 'admin-role') return json({ role: user.role });
    if (method === 'GET' && root === 'admin-roles') {
      const rows = await env.APP_DB.prepare("SELECT id AS userId,email,display_name AS name,role FROM users WHERE role!='customer' ORDER BY created_at").all();
      return json(rows.results || []);
    }
    if (method === 'GET' && root === 'my-orders') {
      const orders = await readList(env, 'orders');
      return json(orders.filter((order: any) => normalizeEmail(order.customerInfo?.email) === user.email));
    }
    if (method === 'GET' && root === 'media' && !id) return json(await readList(env, 'media'));

    if (method === 'POST' && root === 'products' && id === 'bulk') {
      const incoming = Array.isArray(body?.products) ? body.products : [];
      const existing = await productList(env);
      const byId = new Map(existing.map((p: any) => [String(p.id), p]));
      for (const product of incoming) byId.set(String(product.id || product.sku || crypto.randomUUID()), { ...product, id: String(product.id || product.sku || crypto.randomUUID()) });
      await setValue(env, 'products', [...byId.values()]);
      return json({ success: true, count: incoming.length, version: PRODUCT_CATALOGUE_VERSION });
    }
    if (method === 'POST' && root === 'products' && !id) {
      const product = { ...body, id: String(body?.id || body?.sku || crypto.randomUUID()), updatedAt: new Date().toISOString() };
      await mutateList(env, 'products', list => [...list, product]);
      await addActivity(env, user, 'product.create', `Created ${product.name || product.id}`, { id: product.id });
      return json(product, 201, { 'X-Product-Catalogue-Version': PRODUCT_CATALOGUE_VERSION });
    }
    if (method === 'PUT' && root === 'products' && id) {
      const products = await productList(env);
      const index = products.findIndex((p: any) => String(p.id) === id);
      if (index < 0) return json({ error: 'Product not found' }, 404);
      products[index] = { ...products[index], ...body, updatedAt: new Date().toISOString() };
      await setValue(env, 'products', products);
      return json(products[index], 200, { 'X-Product-Catalogue-Version': PRODUCT_CATALOGUE_VERSION });
    }
    if (method === 'DELETE' && root === 'products' && id) {
      await mutateList(env, 'products', list => list.filter((p: any) => String(p.id) !== id));
      return json({ success: true });
    }
    if (method === 'POST' && root === 'pages') {
      const page = { ...body, id: String(body?.id || crypto.randomUUID()), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await mutateList(env, 'pages', list => [...list, page]);
      return json(page, 201);
    }
    if (method === 'POST' && root === 'media' && id === 'upload') {
      if (!body?.base64Data || !body.fileName) return json({ error: 'Choose a file to upload.' }, 400);
      const mediaId = crypto.randomUUID();
      const originalName = String(body.fileName);
      const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 140);
      const objectKey = `uploads/${mediaId}/${safeName}`;
      const binary = Uint8Array.from(atob(String(body.base64Data)), character => character.charCodeAt(0));
      const contentType = String(body.fileType || 'application/octet-stream');
      await env.APP_MEDIA.put(objectKey, binary, { httpMetadata: { contentType }, customMetadata: { originalName } });
      const media = { id: mediaId, name: originalName, storagePath: objectKey, url: `/api/media/file/${mediaId}`, contentType, size: binary.byteLength, createdAt: new Date().toISOString() };
      await mutateList(env, 'media', list => [...list, media]);
      return json(media, 201);
    }
    if (method === 'POST' && root === 'media' && id === 'refresh-urls') {
      const media = await readList(env, 'media');
      return json({ success: true, media: media.map(item => ({ ...item, url: `/api/media/file/${item.id}` })) });
    }
    if (method === 'PUT' && root === 'pages' && id) return updateById(env, 'pages', id, body);
    if (method === 'POST' && root === 'homepage-content' && id === 'publish') {
      const draft = await getValue(env, 'homepage_content_draft', {});
      await setValue(env, 'homepage_content_published', draft);
      await setValue(env, 'homepage_published_at', new Date().toISOString());
      return json({ success: true, publishedAt: new Date().toISOString() });
    }
    if (method === 'PUT' && root === 'homepage-content') { await setValue(env, 'homepage_content_draft', body || {}); return json({ success: true }); }
    if (method === 'PUT' && root === 'site-settings') { await setValue(env, 'site_settings', body || {}); return json({ success: true }); }
    if (method === 'DELETE' && root === 'pages' && id) return deleteById(env, 'pages', id);
    if (method === 'DELETE' && root === 'media' && id) {
      const existing = (await readList(env, 'media')).find(item => item.id === id);
      if (existing?.storagePath) await env.APP_MEDIA.delete(existing.storagePath);
      return deleteById(env, 'media', id);
    }
    if (method === 'PATCH' && root === 'orders' && id) return updateById(env, 'orders', id, body);
    if (method === 'PATCH' && root === 'vendors' && id) return updateById(env, 'vendors', id, body);
    if (method === 'PATCH' && root === 'inquiries' && id) return updateById(env, 'inquiries', id, body);

    const listKey = publicLists[root];
    if (method === 'DELETE' && listKey && id && !(root === 'notifications' && !parts[2])) {
      const updated = await mutateList(env, listKey, list => list.filter((item: any) => String(item.id || item.orderId || item.userId) !== id));
      return json({ success: true, remaining: updated.length });
    }
    if (method === 'PATCH' && root === 'notifications' && parts[2] === 'read') {
      const notificationId = id;
      const updated = await mutateList(env, 'notifications', list => list.map(item => item.id === notificationId ? { ...item, read: true } : item));
      return json({ success: true, remaining: updated.length });
    }
    if (method === 'POST' && root === 'notifications' && id === 'read-all') {
      await mutateList(env, 'notifications', list => list.map(item => ({ ...item, read: true })));
      return json({ success: true });
    }
    if (method === 'POST' && root === 'admin-roles') {
      const email = normalizeEmail(body?.email);
      const role = body?.role;
      if (!['editor', 'admin', 'owner'].includes(role)) return json({ error: 'Invalid role.' }, 400);
      const result = await env.APP_DB.prepare('UPDATE users SET role=?,updated_at=? WHERE email=? COLLATE NOCASE').bind(role, new Date().toISOString(), email).run();
      return result.meta.changes ? json({ success: true }) : json({ error: 'User not found.' }, 404);
    }
    if (method === 'POST' && root === 'page-templates') {
      const template = { ...body, id: String(body?.id || crypto.randomUUID()), createdAt: new Date().toISOString() };
      await mutateList(env, 'page_templates', list => [...list, template]);
      return json(template, 201);
    }
    if (method === 'DELETE' && root === 'notifications' && !id) {
      await setValue(env, 'notifications', []);
      return json({ success: true });
    }
    if (method === 'DELETE' && root === 'admin-roles' && id) {
      await env.APP_DB.prepare("UPDATE users SET role='customer',updated_at=? WHERE id=? AND role!='owner'").bind(new Date().toISOString(), id).run();
      return json({ success: true });
    }


    return json({ error: 'Cloudflare API route is not implemented.', path, method }, 404);
  } catch (error) {
    console.error('Cloudflare API request failed', error);
    return json({ error: 'The request could not be completed.' }, 500);
  }
};

async function updateById(env: AppEnv, key: string, id: string, body: Record<string, any> | null) {
  let found: any = null;
  const updated = await mutateList(env, key, list => list.map(item => {
    if (String(item.id || item.orderId) !== id) return item;
    found = { ...item, ...body, updatedAt: new Date().toISOString() };
    return found;
  }));
  return found ? json(found) : json({ error: 'Record not found' }, 404);
}

async function deleteById(env: AppEnv, key: string, id: string) {
  const before = await readList(env, key);
  const after = before.filter(item => String(item.id || item.orderId) !== id);
  await setValue(env, key, after);
  return json({ success: true, remaining: after.length });
}
