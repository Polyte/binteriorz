const STORAGE_KEY = 'bi_cloudflare_auth_session';
type Listener = (event: string, session: any) => void;
const listeners = new Set<Listener>();

const readSession = () => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!session || session.expires_at * 1000 <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch { return null; }
};

const saveSession = (session: any, event: string) => {
  if (typeof localStorage !== 'undefined') {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach(listener => listener(event, session));
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('bi-auth-change', { detail: session }));
};

async function post(path: string, body?: unknown, token?: string) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body || {}) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return { data: null, error: { message: result.error || 'Authentication failed.' } };
  return { data: result, error: null };
}

export const cloudflareAuth = {
  async getSession() { return { data: { session: readSession() }, error: null }; },
  onAuthStateChange(callback: Listener) {
    listeners.add(callback);
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY) callback('SIGNED_IN', readSession()); };
    const onLocal = (event: Event) => callback('SIGNED_IN', (event as CustomEvent).detail || null);
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
      window.addEventListener('bi-auth-change', onLocal);
    }
    return { data: { subscription: { unsubscribe: () => {
      listeners.delete(callback);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('bi-auth-change', onLocal);
      }
    } } } };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const result = await post('/api/auth/login', { email, password });
    if (result.data?.session) saveSession(result.data.session, 'SIGNED_IN');
    return { data: result.data || {}, error: result.error };
  },
  async signOut() {
    const session = readSession();
    if (session?.access_token) await post('/api/auth/logout', {}, session.access_token);
    saveSession(null, 'SIGNED_OUT');
    return { error: null };
  },
  async refreshSession() { return { data: { session: readSession() }, error: null }; },
};
