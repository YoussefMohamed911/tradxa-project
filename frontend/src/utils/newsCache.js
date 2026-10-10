const PREFIX = 'tradxa:news:v3:';
const memory = new Map();
const pending = new Map();
const LIMIT = 40;

export async function cachedNews(url, ttl, validate) {
  const key = PREFIX + url;
  let saved = memory.get(key);
  try {
    if (!saved) saved = JSON.parse(localStorage.getItem(key) || 'null');
  } catch { /* Storage may be disabled. */ }
  if (saved && Date.now() - saved.time < ttl && validate(saved.data)) {
    return saved.data;
  }
  if (pending.has(key)) return pending.get(key);
  const task = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(response.status === 404 ? 'not_found' : `request_${response.status}`);
      const data = await response.json();
      if (!validate(data)) throw new Error('invalid_response');
      // Never promote a server stale response into fresh cached data.
      if (!data.stale && !data.translationUnavailable) {
        const entry = { time: Date.now(), data };
        memory.set(key, entry);
        if (memory.size > LIMIT) memory.delete(memory.keys().next().value);
        try {
          const entries = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k?.startsWith(PREFIX)) continue;
            let time = 0;
            try { time = JSON.parse(localStorage.getItem(k))?.time || 0; } catch { /* Invalid cache. */ }
            entries.push({ k, time });
          }
          entries.sort((a, b) => b.time - a.time);
          entries.slice(LIMIT - 1).forEach(({ k }) => localStorage.removeItem(k));
          localStorage.setItem(key, JSON.stringify(entry));
        } catch { /* Quota errors must not hide the article. */ }
      }
      return data;
    } finally { clearTimeout(timeout); }
  })();
  pending.set(key, task);
  try { return await task; } finally { pending.delete(key); }
}
