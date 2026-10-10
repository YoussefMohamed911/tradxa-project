import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categories, homeCategories, label, cover, plainText, dateText, useMarketData, TranslationNotice } from '../utils/marketNewsData';
import './MarketNews.css';

function Arrow({ ar }) { return <span aria-hidden="true">{ar ? '↖' : '↗'}</span>; }
function CoverImage({ category }) {
  return <img src={cover(category)} alt="" loading="lazy" decoding="async" width="1280" height="720" />;
}
function CategoryTile({ category, ar, index, latest = false }) {
  return latest ? <LatestTile category={category} ar={ar} index={index} /> : (
    <Link className={`txn-tile txn-directory-tile txn-${category}`} to={`/news?category=${category}`}>
      <CoverImage category={category} />
      <span className="txn-tile-top"><span>{String(index + 1).padStart(2, '0')}</span><Arrow ar={ar} /></span>
      <div className="txn-tile-copy"><h2>{label(category, ar)}</h2><span className="txn-tile-footer">{ar ? 'استكشف أخبار القسم' : 'Explore this market'} <Arrow ar={ar} /></span></div>
    </Link>
  );
}
function LatestTile({ category, ar, index }) {
  const { data, loading, error } = useMarketData({ type: 'list', category, page: '1', size: '1' }, ar ? 'ar' : 'en');
  const item = data?.items?.[0];
  return <Link className={`txn-tile txn-latest-tile txn-${category}`} to={`/news?category=${category}`}>
    <CoverImage category={category} />
    <span className="txn-tile-top"><span>{label(category, ar)}</span><span>{String(index + 1).padStart(2, '0')}</span></span>
    <div className="txn-tile-copy">
      {item && <time dateTime={item.publishedAt}>{dateText(item.publishedAt, ar)}</time>}
      <h3 dir="auto" lang={data?.contentLanguage || 'ar'}>{item ? plainText(item.title) : loading ? (ar ? 'جاري تحميل آخر خبر…' : 'Loading the latest story…') : error ? (ar ? 'افتح القسم لإعادة المحاولة' : 'Open this market to retry') : (ar ? 'لا توجد أخبار متاحة' : 'No stories available')}</h3>
      {item && !ar && data?.contentLanguage !== 'en' && <small className="txn-original">Original Arabic · English unavailable</small>}
      <span className="txn-tile-footer">{ar ? 'كل أخبار القسم' : 'Explore stories'} <Arrow ar={ar} /></span>
    </div>
  </Link>;
}
export default function HomeMarketNews() {
  const { i18n } = useTranslation();
  const ar = i18n.language.startsWith('ar');
  return <section className="txn txn-home" dir={ar ? 'rtl' : 'ltr'}>
    <div className="container">
      <div className="txn-heading"><div><span className="txn-eyebrow">TRADXA / {ar ? 'الأسواق' : 'MARKETS'}</span><h2>{ar ? 'آخر أخبار الأسواق' : 'Latest Market News'}</h2></div><Link className="txn-all" to="/news">{ar ? 'كل الأخبار' : 'All news'} <Arrow ar={ar} /></Link></div>
      <div className="txn-home-grid">{homeCategories.map((category, index) => <CategoryTile key={category} {...{ category, ar, index }} latest />)}</div>
    </div>
  </section>;
}
export function MarketNewsPage() {
  const { i18n } = useTranslation();
  const ar = i18n.language.startsWith('ar');
  const [params] = useSearchParams();
  const category = params.get('category');
  const validCategory = categories.includes(category) || category === 'metals';
  if (validCategory) return <CategoryStories key={category} category={category} ar={ar} />;
  return <main className="txn txn-page" dir={ar ? 'rtl' : 'ltr'}><div className="container">
    <header className="txn-heading txn-page-heading"><div><span className="txn-eyebrow">TRADXA / {ar ? 'الأخبار' : 'NEWS'}</span><h1>{ar ? 'اختر السوق. تابع الصورة الكاملة.' : 'Choose your market.'}</h1><p>{ar ? 'سبعة أقسام. آخر الأخبار والتطورات في مكان واحد.' : 'Seven markets. The stories that move them.'}</p></div><span className="txn-count">07 <small>{ar ? 'أسواق' : 'MARKETS'}</small></span></header>
    <section className="txn-directory-grid" aria-label={ar ? 'أقسام الأخبار' : 'News categories'}>{categories.map((category, index) => <CategoryTile key={category} {...{ category, ar, index }} />)}</section>
  </div></main>;
}
function CategoryStories({ category, ar }) {
  const [params, setParams] = useSearchParams();
  const rawPage = Number(params.get('page') || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 && rawPage <= 10000 ? rawPage : 1;
  const { data, loading, error, reload } = useMarketData({ type: 'list', category, page: String(page), size: '12' }, ar ? 'ar' : 'en');
  const items = data?.items || [];
  function go(next) { setParams({ category, page: String(next) }); window.scrollTo({ top: 0 }); }
  return <main className="txn txn-page" dir={ar ? 'rtl' : 'ltr'}><div className="container">
    <Link className="txn-back" to="/news">{ar ? '→ كل الأقسام' : '← All markets'}</Link>
    <header className="txn-category-hero"><CoverImage category={category} /><div><span className="txn-eyebrow">TRADXA / {ar ? 'الأخبار' : 'NEWS'}</span><h1>{label(category, ar)}</h1><p>{ar ? 'آخر الأخبار، من الأحدث إلى الأقدم.' : 'The latest stories, newest first.'}</p></div></header>
    <nav className="txn-tabs" aria-label={ar ? 'أقسام الأخبار' : 'News categories'}>{categories.map(c => <Link key={c} to={`/news?category=${c}`} aria-current={category === c ? 'page' : undefined}>{label(c, ar)}</Link>)}</nav>
    <TranslationNotice ar={ar} data={data} onRetry={reload} />
    {loading && <p className="txn-status" role="status">{ar ? 'جاري تحميل الأخبار…' : 'Loading stories…'}</p>}
    {(error || data?.stale) && <p className="txn-status" role="status">{ar ? 'تعذّر تحديث الأخبار.' : 'Unable to refresh stories.'} <button onClick={reload}>{ar ? 'حاول مجددًا' : 'Try again'}</button></p>}
    {!loading && !error && !items.length && <p className="txn-status">{ar ? 'لا توجد أخبار في هذه الصفحة.' : 'No stories on this page.'}</p>}
    <section className="txn-stories" aria-busy={loading}>{items.map((item, index) => <Link className="txn-story" key={item.id} to={`/news/${item.id}?category=${category}`}>
      <span className="txn-story-number">{String((page - 1) * 12 + index + 1).padStart(2, '0')}</span><div><time dateTime={item.publishedAt}>{dateText(item.publishedAt, ar)}</time><h2 dir="auto" lang={data.contentLanguage || 'ar'}>{plainText(item.title)}</h2><span className="txn-story-read">{ar ? 'اقرأ الخبر' : 'Read story'} <Arrow ar={ar} /></span></div><div className="txn-story-image"><CoverImage category={category} /></div>
    </Link>)}</section>
    <nav className="txn-pagination" aria-label={ar ? 'صفحات الأخبار' : 'News pages'}><button disabled={page === 1 || loading} onClick={() => go(page - 1)}>{ar ? 'السابق' : 'Previous'}</button><span>{ar ? 'صفحة' : 'Page'} {page}</span><button disabled={!data?.hasNext || loading || !!error || data?.stale} onClick={() => go(page + 1)}>{ar ? 'التالي' : 'Next'}</button></nav>
  </div></main>;
}
