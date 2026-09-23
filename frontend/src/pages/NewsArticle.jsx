import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './NewsArticle.css'

const articles = [
  {
    id: 1,
    slug: 'gold-market-update',
    category: 'gold',
    titleKey: 'news.gold',
    image: '/news/gold.png',
  },
  {
    id: 2,
    slug: 'silver-market-update',
    category: 'silver',
    titleKey: 'news.silver',
    image: '/news/silver.png',
  },
  {
    id: 3,
    slug: 'oil-market-update',
    category: 'oil',
    titleKey: 'news.oil',
    image: '/news/oil.png',
  },
  {
    id: 4,
    slug: 'forex-market-update',
    category: 'forex',
    titleKey: 'news.forex',
    image: '/news/forex.png',
  },
  {
    id: 5,
    slug: 'crypto-market-update',
    category: 'crypto',
    titleKey: 'news.crypto',
    image: '/news/crypto.png',
  },
  {
    id: 6,
    slug: 'commodities-market-update',
    category: 'commodities',
    titleKey: 'news.commodities',
    image: '/news/commodities.png',
  },
  {
    id: 7,
    slug: 'stocks-market-update',
    category: 'stocks',
    titleKey: 'news.stocks',
    image: '/news/stocks.png',
  },
]

function NewsArticle() {
  const { slug } = useParams()
  const { t } = useTranslation()

  const article = articles.find(
    (item) => item.slug === slug
  )

  if (!article) {
    return (
      <main className="article-page">
        <div className="container article-not-found">
          <span>404</span>
          <h1>Article not found</h1>

          <Link to="/news">
            Back to News
          </Link>
        </div>
      </main>
    )
  }

  const relatedArticles = articles
    .filter((item) => item.id !== article.id)
    .slice(0, 3)

  return (
    <main className="article-page">

      <section className="article-header">
        <div className="container article-header-inner">

          <Link
            to="/news"
            className="article-back"
          >
            ← Back to News
          </Link>

          <span className="article-category">
            {t(`categories.${article.category}`)}
          </span>

          <h1>{t(article.titleKey)}</h1>

          <div className="article-meta">
            <span>Tradxa</span>
            <span />
            <span>Market Update</span>
          </div>

        </div>
      </section>


      <section className="article-content">
        <div className="container">

          <div className="article-layout">

            <article className="article-main">

              <img
                src={article.image}
                alt={t(article.titleKey)}
                className="article-main-image"
              />

              <div className="article-body">

                <p className="article-lead">
                  Tradxa tracks important market developments
                  across global financial markets to help traders
                  stay informed and understand the context behind
                  market movements.
                </p>

                <h2>Market Overview</h2>

                <p>
                  This section will contain the complete market
                  update once the Tradxa news backend is connected.
                  News articles will include relevant market
                  context, key developments and important levels
                  traders may want to monitor.
                </p>

                <p>
                  The current article is demonstration content used
                  to complete the Tradxa news interface before live
                  news data is connected.
                </p>

                <div className="article-highlight">
                  <span>TRADXA NOTE</span>

                  <p>
                    Always evaluate market information alongside
                    your own analysis and risk-management plan.
                  </p>
                </div>

                <h2>What to Watch</h2>

                <p>
                  Future live articles can include upcoming
                  economic events, volatility considerations,
                  technical levels and related market developments.
                </p>

              </div>

            </article>


            <aside className="article-sidebar">

              <div className="article-sidebar-title">
                <span>MORE STORIES</span>
                <h3>Related News</h3>
              </div>

              {relatedArticles.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.slug}`}
                  className="related-news-card"
                >
                  <img
                    src={item.image}
                    alt={t(item.titleKey)}
                  />

                  <div>
                    <span>
                      {t(`categories.${item.category}`)}
                    </span>

                    <strong>
                      {t(item.titleKey)}
                    </strong>
                  </div>
                </Link>
              ))}

            </aside>

          </div>


          <p className="article-disclaimer">
            Market content is provided for informational and
            educational purposes only and is not financial advice.
          </p>

        </div>
      </section>

    </main>
  )
}

export default NewsArticle