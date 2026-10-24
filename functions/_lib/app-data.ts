import { productCatalogue, PRODUCT_CATALOGUE_VERSION } from '../../src/app/data/catalogue';
import { userFromRequest, type AuthUser } from './auth';

export interface AppEnv {
  APP_DB: D1Database;
  APP_MEDIA: R2Bucket;
  NEWS_API_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  STORE_NOTIFICATION_EMAIL?: string;
}

export const json = (data: unknown, status = 200, headers: HeadersInit = {}) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
export const text = (value: string, status = 200) => new Response(value, { status, headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' } });

const keyFor = (key: string) => `b_interiors_${key}`;

export async function getValue<T>(env: AppEnv, key: string, fallback: T): Promise<T> {
  const row = await env.APP_DB.prepare('SELECT value FROM app_kv WHERE key=?').bind(keyFor(key)).first<{ value: string }>();
  if (!row) return fallback;
  try { return JSON.parse(row.value) as T; } catch { return fallback; }
}

export async function setValue(env: AppEnv, key: string, value: unknown): Promise<void> {
  await env.APP_DB.prepare('INSERT INTO app_kv (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at')
    .bind(keyFor(key), JSON.stringify(value), new Date().toISOString()).run();
}

export async function currentUser(request: Request, env: AppEnv): Promise<AuthUser | null> {
  return userFromRequest(request, env);
}

export async function requireAdmin(request: Request, env: AppEnv, minimum: 'editor' | 'admin' | 'owner' = 'editor') {
  const user = await currentUser(request, env);
  const levels: Record<AuthUser['role'], number> = { customer: 0, editor: 1, admin: 2, owner: 3 };
  return user && levels[user.role] >= levels[minimum] ? user : null;
}

export async function productList(env: AppEnv) {
  const products = await getValue<any[] | null>(env, 'products', null);
  return Array.isArray(products) && products.length ? products : productCatalogue;
}

export async function productResponse(env: AppEnv) {
  return json(await productList(env), 200, { 'X-Product-Catalogue-Version': PRODUCT_CATALOGUE_VERSION });
}

export async function addActivity(env: AppEnv, user: AuthUser | null, action: string, details: string, metadata?: unknown) {
  const logs = await getValue<any[]>(env, 'activity_log', []);
  await setValue(env, 'activity_log', [{ id: crypto.randomUUID(), userId: user?.id || 'system', email: user?.email || 'system', role: user?.role || 'system', action, details, metadata: metadata || null, timestamp: new Date().toISOString() }, ...logs].slice(0, 500));
}

export async function addNotification(env: AppEnv, type: string, title: string, message: string, actionTab?: string, meta?: unknown) {
  const notifications = await getValue<any[]>(env, 'notifications', []);
  await setValue(env, 'notifications', [{ id: crypto.randomUUID(), type, title, message, actionTab: actionTab || null, meta: meta || null, read: false, createdAt: new Date().toISOString() }, ...notifications].slice(0, 200));
}

export async function parseJson(request: Request): Promise<Record<string, any> | null> {
  try { const value = await request.json(); return value && typeof value === 'object' ? value as Record<string, any> : null; }
  catch { return null; }
}

export function normalizeEmail(email: unknown): string { return String(email || '').trim().toLowerCase(); }
