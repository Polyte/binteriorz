import bcrypt from 'bcryptjs';

export interface AuthEnv { APP_DB: D1Database; }

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: 'customer' | 'editor' | 'admin' | 'owner';
}

const encoder = new TextEncoder();
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 310_000 }, key, 256);
  return [...new Uint8Array(bits)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function randomHex(size: number): string {
  return [...crypto.getRandomValues(new Uint8Array(size))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function jsonResponse(data: unknown, status = 200) { return json(data, status); }

export async function createSession(env: AuthEnv, user: AuthUser) {
  const token = randomHex(32);
  const tokenHash = await digest(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await env.APP_DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(tokenHash, user.id, expiresAt).run();
  return { access_token: token, token_type: 'bearer', expires_in: 604800, expires_at: Math.floor(Date.parse(expiresAt) / 1000), user: { id: user.id, email: user.email, user_metadata: { display_name: user.display_name }, app_metadata: { role: user.role } } };
}

export async function userFromRequest(request: Request, env: AuthEnv): Promise<AuthUser | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const tokenHash = await digest(token);
  const result = await env.APP_DB.prepare(`SELECT u.id, u.email, u.display_name, u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at > ?`).bind(tokenHash, new Date().toISOString()).first<AuthUser>();
  return result || null;
}

async function parseBody(request: Request): Promise<Record<string, unknown> | null> {
  try { const body = await request.json(); return body && typeof body === 'object' ? body as Record<string, unknown> : null; }
  catch { return null; }
}

export async function onRequestPost({ request, env }: { request: Request; env: AuthEnv }) {
  const body = await parseBody(request);
  if (!body) return json({ error: 'Invalid request body.' }, 400);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 256) return json({ error: 'Enter a valid email and a password with at least 8 characters.' }, 400);

  const attemptKey = await digest(`${email}|${request.headers.get('cf-connecting-ip') || 'unknown'}`);
  const now = Math.floor(Date.now() / 1000);
  const attempts = await env.APP_DB.prepare('SELECT failures, window_started_at FROM auth_attempts WHERE attempt_key=?').bind(attemptKey).first<{ failures: number; window_started_at: number }>();
  if (attempts && attempts.window_started_at > now - 900 && attempts.failures >= 8) return json({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);

  const row = await env.APP_DB.prepare('SELECT id, email, display_name, password_hash, role FROM users WHERE email=? COLLATE NOCASE').bind(email).first<AuthUser & { password_hash: string }>();
  if (!row) {
    await env.APP_DB.prepare(`INSERT INTO auth_attempts (attempt_key, failures, window_started_at) VALUES (?, 1, ?) ON CONFLICT(attempt_key) DO UPDATE SET failures=CASE WHEN window_started_at < ? THEN 1 ELSE failures+1 END, window_started_at=CASE WHEN window_started_at < ? THEN excluded.window_started_at ELSE window_started_at END`).bind(attemptKey, now, now - 900, now - 900).run();
    return json({ error: 'Invalid email or password.' }, 401);
  }
  let validPassword = false;
  if (row.password_hash.startsWith('bcrypt:')) {
    validPassword = await bcrypt.compare(password, row.password_hash.slice('bcrypt:'.length));
    if (validPassword) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const saltHex = [...salt].map(byte => byte.toString(16).padStart(2, '0')).join('');
      await env.APP_DB.prepare('UPDATE users SET password_hash=?,updated_at=? WHERE id=?').bind(`${saltHex}:${await hashPassword(password, salt)}`, new Date().toISOString(), row.id).run();
    }
  } else {
    const [saltHex, storedHash] = row.password_hash.split(':');
    const salt = new Uint8Array(saltHex.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const calculated = await hashPassword(password, salt);
    let diff = calculated.length ^ storedHash.length;
    for (let i = 0; i < Math.max(calculated.length, storedHash.length); i++) diff |= (calculated.charCodeAt(i) || 0) ^ (storedHash.charCodeAt(i) || 0);
    validPassword = diff === 0;
  }
  if (!validPassword) {
    await env.APP_DB.prepare(`INSERT INTO auth_attempts (attempt_key, failures, window_started_at) VALUES (?, 1, ?) ON CONFLICT(attempt_key) DO UPDATE SET failures=CASE WHEN window_started_at < ? THEN 1 ELSE failures+1 END, window_started_at=CASE WHEN window_started_at < ? THEN excluded.window_started_at ELSE window_started_at END`).bind(attemptKey, now, now - 900, now - 900).run();
    return json({ error: 'Invalid email or password.' }, 401);
  }
  await env.APP_DB.prepare('DELETE FROM auth_attempts WHERE attempt_key=?').bind(attemptKey).run();
  const { password_hash: _passwordHash, ...user } = row;
  return json({ session: await createSession(env, user), user: { id: user.id, email: user.email } });
}

export async function signup({ request, env }: { request: Request; env: AuthEnv }) {
  const body = await parseBody(request);
  if (!body) return json({ error: 'Invalid request body.' }, 400);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const name = String(body.name || body.displayName || '').trim().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 256) return json({ error: 'Enter a valid email and a password with at least 8 characters.' }, 400);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = [...salt].map(byte => byte.toString(16).padStart(2, '0')).join('');
  const passwordHash = `${saltHex}:${await hashPassword(password, salt)}`;
  const existingUsers = await env.APP_DB.prepare('SELECT COUNT(*) AS count FROM users').first<{ count: number }>();
  const role = existingUsers?.count === 0 ? 'owner' : 'customer';
  const user = { id: crypto.randomUUID(), email, display_name: name, role: role as AuthUser['role'] };
  try {
    await env.APP_DB.prepare('INSERT INTO users (id,email,display_name,password_hash,role) VALUES (?,?,?,?,?)').bind(user.id, email, name, passwordHash, role).run();
  } catch { return json({ error: 'An account with that email already exists.' }, 409); }
  return json({ user: { id: user.id, email, display_name: name } }, 201);
}

export async function sessionGet({ request, env }: { request: Request; env: AuthEnv }) {
  const user = await userFromRequest(request, env);
  return user ? json({ user: { id: user.id, email: user.email, user_metadata: { display_name: user.display_name }, app_metadata: { role: user.role } } }) : json({ error: 'Unauthorized' }, 401);
}

export async function logout({ request, env }: { request: Request; env: AuthEnv }) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (token) await env.APP_DB.prepare('DELETE FROM sessions WHERE id=?').bind(await digest(token)).run();
  return json({ success: true });
}
