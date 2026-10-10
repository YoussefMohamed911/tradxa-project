import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categories, label, cover, plainText, dateText, useMarketData, TranslationNotice } from '../utils/marketNewsData';
import '../components/MarketNews.css';
import './NewsArticle.css';

// Render safe text blocks, preserving headings without inserting remote HTML.
export function articleBlocks(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,form,noscript,svg,nav,footer,header').forEach(el => el.remove());
  const blocks = [];
  const walk = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      if (text) blocks.push({ type: 'p', text });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'].includes(tag)) {
      node.querySelectorAll('br').forEach(el => el.replaceWith(doc.createTextNode('\n')));
      const text = node.textContent.trim();
      if (text) blocks.push({ type: /^h/.test(tag) ? 'h2' : tag === 'blockquote' ? 'blockquote' : 'p', text: tag === 'li' ? `• ${text}` : text });
    } else Array.from(node.childNodes).forEach(walk);
  };
  Array.from(doc.body.childNodes).forEach(walk);
  return blocks;
}
export default function NewsArticle() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { i18n } = useTranslation();
  const ar = i18n.language.startsWith('ar');
  const requested = params.get('category');
  const category = categories.includes(requested) || requested === 'metals' ? requested : null;
  const { data, loading, error, reload } = useMarketData({ type: 'article', id: slug || '' }, ar ? 'ar' : 'en', 3600000);
  const article = data?.article;
  const blocks = article ? articleBlocks(article.content) : [];
  const back = category ? `/news?category=${category}` : '/news';
  const words = blocks.reduce((sum, b) => sum + b.text.split(/\s+/).length, 0);
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return <main className="txn txa-page" dir={ar ? 'rtl' : 'ltr'}><div className="container">
    <Link to={back} className="txn-back">{ar ? '→ العودة للأخبار' : '← Back to stories'}</Link>
    {loading && <div className="txa-loading" role="status"><span className="txn-eyebrow">TRADXA / NEWS</span><p>{ar ? 'جاري تحميل المقال…' : 'Loading article…'}</p><div /><div /><div /></div>}
    {!loading && (error || !article) && <div className="txa-error"><h1>{error === 'not_found' ? ar ? 'الخبر غير موجود' : 'Article not found' : ar ? 'تعذّر تحميل المقال' : 'Unable to load article'}</h1><button onClick={reload}>{ar ? 'حاول مجددًا' : 'Try again'}</button></div>}
    {!loading && article && <>
      <header className="txa-header"><div><span className="txn-eyebrow">TRADXA / {label(category, ar)}</span><h1 dir="auto" lang={data.contentLanguage}>{plainText(article.title)}</h1><div className="txa-meta"><time dateTime={article.publishedAt}>{dateText(article.publishedAt, ar)}</time><span>{ar ? `${readingTime} ${readingTime === 1 ? "دقيقة قراءة" : "دقائق قراءة"}` : `${readingTime} min read`}</span></div></div>{category && <figure><img src={cover(category)} alt="" width="1280" height="720" /><figcaption>{ar ? 'صورة توضيحية للقسم' : 'Category illustration'}</figcaption></figure>}</header>
      <TranslationNotice ar={ar} data={data} onRetry={reload} />
      <div className="txa-layout"><aside className="txa-aside"><span className="txn-eyebrow">{ar ? 'في هذا المقال' : 'IN THIS STORY'}</span>{blocks.filter(b => b.type === 'h2').length ? blocks.map((b, i) => b.type === 'h2' && <a key={i} href={`#section-${i}`} dir="auto">{b.text}</a>) : <span>{label(category, ar)}</span>}<Link to={back}>{ar ? 'المزيد من الأخبار ↗' : 'More stories ↗'}</Link></aside>
      <article className="txa-body" dir={data.contentLanguage === 'en' ? 'ltr' : 'rtl'} lang={data.contentLanguage}>{blocks.length ? blocks.map((b, i) => { const Tag = b.type; return <Tag key={i} id={b.type === 'h2' ? `section-${i}` : undefined}>{b.text}</Tag>; }) : <p>{ar ? 'نص الخبر غير متاح.' : 'Article text is unavailable.'}</p>}<footer className="txa-end"><span>TRADXA / {ar ? 'نهاية المقال' : 'END OF STORY'}</span><Link to={back}>{ar ? 'تابع قراءة الأخبار ←' : 'Keep reading →'}</Link></footer></article></div>
      <p className="txa-disclaimer">{ar ? 'المحتوى للمعلومات العامة ولا يمثل نصيحة استثمارية.' : 'For general information, not investment advice.'}</p>
    </>}
  </div></main>;
}
