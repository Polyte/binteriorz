export const prefetch = (url: string) => {
  if (!url || url.startsWith('http') || typeof window === 'undefined') return;
  fetch(url, { headers: { 'Purpose': 'prefetch' } }).catch(() => {});
};
