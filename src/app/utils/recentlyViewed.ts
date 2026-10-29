// Recently viewed product IDs, kept in this browser only.
const STORAGE_KEY = 'bi_recently_viewed';
const MAX_ITEMS = 12;

/** Read recently viewed IDs from localStorage */
export function getRecentlyViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Record a product view (most recent first, deduplicated, capped) */
export function trackProductView(productId: string) {
  try {
    const ids = getRecentlyViewedIds().filter((id) => id !== productId);
    ids.unshift(productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage might be full – gracefully degrade
  }
}
