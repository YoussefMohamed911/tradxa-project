import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './News.css'

const categories = [
  'all',
  'gold',
  'silver',
  'oil',
  'forex',
  'crypto',
  'commodities',
  'stocks',
]

const newsItems = [
  {
    id: 1,
    slug: 'gold-market-update',
    category: 'gold',
    minutes: 8,
    titleKey: 'news.gold',
    image: '/news/gold.png',
  },
  {
    id: 2,
    slug: 'silver-market-update',
    category: 'silver',
    minutes: 14,
    titleKey: 'news.silver',
    image: '/news/silver.png',
  },
  {
    id: 3,
    slug: 'oil-market-update',
    category: 'oil',
    minutes: 21,
    titleKey: 'news.oil',
    image: '/news/oil.png',
  },
  {
    id: 4,
    slug: 'forex-market-update',
    category: 'forex',
    minutes: 28,
    titleKey: 'news.forex',
    image: '/news/forex.png',
  },
  {
    id: 5,
    slug: 'crypto-market-update',
    category: 'crypto',
    minutes: 37,
    titleKey: 'news.crypto',
    image: '/news/crypto.png',
  },
  {
    id: 6,
    slug: 'commodities-market-update',
    category: 'commodities',
    minutes: 43,
    titleKey: 'news.commodities',
    image: '/news/commodities.png',
  },
  {
    id: 7,
    slug: 'stocks-market-update',
    category: 'stocks',
    minutes: 48,
    titleKey: 'news.stocks',
    image: '/news/stocks.png',
  },
]

function News() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeCategory =
    searchParams.get('category') || 'all'

  const setCategory = (category) => {
    if (category === 'all') {
      setSearchParams({})
      return
    }

    setSearchParams({ category })
  }

  const filteredNews =
    activeCategory === 'all'
      ? newsItems
      : newsItems.filter(
          (item) => item.category === activeCategory
        )

  return (
    <main className="news-page">
      <div className="container">

        <section className="news-page-header">
          <div>
            <span className="news-page-eyebrow">
              TRADXA NEWS
            </span>

            <h1>{t('home.latestNews')}</h1>

            <p>
              Latest financial market news, insights and
              global market updates.
            </p>
          </div>
        </section>

        <div className="news-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? 'news-filter active'
                  : 'news-filter'
              }
              onClick={() => setCategory(category)}
            >
              {category === 'all'
                ? t('market.all')
                : t(`categories.${category}`)}
            </button>
          ))}
        </div>

        <section className="news-page-grid">

          {filteredNews.map((item) => (
            <article
              key={item.id}
              className={`news-page-card news-${item.category}`}
            >

              <Link
                to={`/news/${item.slug}`}
                className="news-card-visual"
              >
                <img
                  src={item.image}
                  alt={t(item.titleKey)}
                  className="news-card-image"
                />

                <span className="news-card-category">
                  {t(`categories.${item.category}`)}
                </span>
              </Link>

              <div className="news-page-card-content">

                <div className="news-page-card-meta">
                  <span>{t('news.marketUpdate')}</span>

                  <span className="meta-dot" />

                  <span>
                    {t('common.minutesAgo', {
                      count: item.minutes,
                    })}
                  </span>
                </div>

                <Link
                  to={`/news/${item.slug}`}
                  className="news-title-link"
                >
                  <h2>{t(item.titleKey)}</h2>
                </Link>

                <div className="news-page-card-bottom">
                  <span>Tradxa</span>

                  <Link
                    to={`/news/${item.slug}`}
                    className="news-read-btn"
                    aria-label="Read article"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </Link>
                </div>

              </div>

            </article>
          ))}

        </section>
      </div>
    </main>
  )
}

export default News