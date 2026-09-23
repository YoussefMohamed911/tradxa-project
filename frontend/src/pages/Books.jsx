import './Books.css'
import forexCover from '../assets/forex-cover.png'

const educationItems = [
  {
    number: '01',
    title: 'Trading Basics',
    text: 'Learn the foundations of financial markets, trading terminology and how markets move.',
    status: 'Coming Soon',
  },
  {
    number: '02',
    title: 'Risk Management',
    text: 'Understand position sizing, stop loss, risk-to-reward and protecting trading capital.',
    status: 'Coming Soon',
  },
  {
    number: '03',
    title: 'Technical Analysis',
    text: 'Learn market structure, support and resistance, trends and technical analysis basics.',
    status: 'Coming Soon',
  },
]

function Books() {
  return (
    <main className="books-page">

      <section className="books-hero">
        <div className="container">

          <span className="books-eyebrow">
            TRADXA EDUCATION
          </span>

          <h1>Education</h1>

          <p>
            Learn trading through practical books, guides and
            structured educational resources.
          </p>

        </div>
      </section>


      <section className="books-content">
        <div className="container">


          <div className="education-section-head">
            <div>
              <span className="books-eyebrow">
                LEARNING CENTER
              </span>

              <h2>Start Learning</h2>
            </div>

            <span className="education-count">
              4 Resources
            </span>
          </div>


          <div className="education-grid">

            {educationItems.map((item) => (
              <article
                className="education-card"
                key={item.number}
              >

                <div className="education-card-top">
                  <span>{item.number}</span>

                  <small>
                    {item.status}
                  </small>
                </div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>

              </article>
            ))}

          </div>


          <div className="education-section-head book-section-title">
            <div>
              <span className="books-eyebrow">
                TRADING BOOKS
              </span>

              <h2>Featured Book</h2>
            </div>
          </div>


          <article className="featured-book">

            <div className="book-cover-wrap">

              <img
                src={forexCover}
                alt="Learn Forex"
                className="book-cover"
              />

            </div>


            <div className="book-info">

              <span className="book-label">
                BEGINNER GUIDE
              </span>

              <h2>Learn Forex</h2>

              <h3>
                A practical beginner guide to understanding
                the forex market.
              </h3>

              <p>
                Learn currency pairs, charts, market structure,
                risk management and the foundations needed to
                build a structured trading plan.
              </p>


              <div className="book-meta">
                <span>36 Pages</span>
                <span>Beginner</span>
                <span>Arabic</span>
                <span>PDF</span>
              </div>


              <div className="book-actions">

                <a
                  href="/books/forex-guide.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="book-btn primary"
                >
                  Read Book
                </a>

                <a
                  href="/books/forex-guide.pdf"
                  download
                  className="book-btn secondary"
                >
                  Download PDF
                </a>

              </div>

            </div>

          </article>


          <p className="books-disclaimer">
            Educational content only. Tradxa does not provide
            financial or investment advice.
          </p>

        </div>
      </section>

    </main>
  )
}

export default Books