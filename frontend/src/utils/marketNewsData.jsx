import { useEffect, useState } from 'react';
import { cachedNews } from './newsCache';

// The seven original categories, in their original order.
export const categories = ['gold', 'silver', 'oil', 'forex', 'crypto', 'commodities', 'stocks'];
// Preserve the existing six home categories. Metals contains gold and silver.
export const homeCategories = ['forex', 'metals', 'crypto', 'oil', 'stocks', 'commodities'];
export const labels = {
  gold: ['Gold', 'الذهب'], silver: ['Silver', 'الفضة'], oil: ['Oil', 'النفط'],
  forex: ['Forex', 'الفوركس'], crypto: ['Crypto', 'العملات الرقمية'],
  commodities: ['Stocks & commodities', 'أسهم وسلع'], stocks: ['Stock markets', 'البورصات'],
  metals: ['Metals', 'المعادن'],
};
export const label = (category, ar) => (labels[category] || ['Market news', 'أخبار الأسواق'])[ar ? 1 : 0];
export const cover = (category) => `/news/${category === 'metals' ? 'gold' : categories.includes(category) ? category : 'forex'}.webp`;
export const plainText = (value = '') => new DOMParser().parseFromString(value, 'text/html').body.textContent?.trim() || '';
export function dateText(value, ar) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? date.toLocaleString(ar ? 'ar-EG' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '';
}

export function useMarketData(query, lang, ttl = 300000) {
  const queryString = new URLSearchParams(query).toString();
  const key = `${queryString}:${lang}`;
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ key: '', data: null, loading: true, error: '' });
  useEffect(() => {
    let active = true;
    let busy = false;
    const isArticle = query.type === 'article';
    const valid = (d) => isArticle
      ? typeof d?.article?.title === 'string' && typeof d?.article?.content === 'string'
      : Array.isArray(d?.items);
    async function load() {
      if (busy || !active) return;
      busy = true;
      try {
        const base = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
        if (!base) throw new Error('missing_url');
        const translated = import.meta.env.VITE_NEWS_TRANSLATION_ENABLED === 'true';
        const params = new URLSearchParams(queryString);
        const endpoint = translated ? 'tradxa-news' : isArticle ? 'boursa-article' : 'boursa-news';
        if (translated) params.set('lang', lang);
        else params.delete('type');
        const result = await cachedNews(`${base}/functions/v1/${endpoint}?${params}`, ttl, valid);
        const data = { ...result, contentLanguage: result.contentLanguage || 'ar' };
        if (active) setState({ key, data, loading: false, error: '' });
      } catch (e) {
        if (active) setState(old => ({ key, data: old.key === key ? old.data : null, loading: false, error: e.message }));
      } finally { busy = false; }
    }
    load();
    const visible = () => { if (!document.hidden) load(); };
    const timer = isArticle ? null : setInterval(visible, 300000);
    if (!isArticle) document.addEventListener('visibilitychange', visible);
    return () => { active = false; clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, [key, queryString, lang, retry, ttl]);
  const current = state.key === key ? state : { data: null, loading: true, error: '' };
  return { ...current, reload: () => { setState(old => ({ ...old, loading: true })); setRetry(n => n + 1); } };
}

export function TranslationNotice({ ar, data, onRetry }) {
  if (ar || !data || data.contentLanguage === 'en') return null;
  return <p className="txn-notice" role="status">English translation is currently unavailable. Showing the original Arabic text. {onRetry && <button type="button" onClick={onRetry}>Retry translation</button>}</p>;
}
