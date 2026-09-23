import './signals.css'

const watchedMarkets = [
  'XAU/USD',
  'BTC/USD',
  'USOIL',
  'USD30',
  'DAX/USD',
  'EUR/USD',
  'GBP/USD',
  'AUD/USD',
  'NZD/USD',
  'USD/CAD',
  'USD/CHF',
  'USD/JPY',
]

function Signals() {
  return (
    <main className="signals-page">

      <section className="signals-hero">
        <div className="container signals-hero-inner">

          <div>
            <span className="signals-eyebrow">
              TRADXA INTELLIGENCE
            </span>

            <h1>Trading Signals</h1>

            <p>
              Market opportunities, technical analysis and trade
              setups delivered through the Tradxa signal engine.
            </p>
          </div>

          <div className="signals-engine-status">
            <span className="signals-status-dot" />

            <div>
              <strong>Signal Engine</strong>
              <span>Backend connection pending</span>
            </div>
          </div>

        </div>
      </section>


      <section className="signals-content">
        <div className="container">

          <div className="signals-stats">

            <article className="signal-stat-card">
              <span>ACTIVE SIGNALS</span>
              <strong>0</strong>
              <small>No live setups</small>
            </article>

            <article className="signal-stat-card">
              <span>MARKETS</span>
              <strong>12</strong>
              <small>Monitored instruments</small>
            </article>

            <article className="signal-stat-card">
              <span>WIN RATE</span>
              <strong>—</strong>
              <small>Waiting for trade history</small>
            </article>

            <article className="signal-stat-card">
              <span>CLOSED TRADES</span>
              <strong>0</strong>
              <small>Performance tracking ready</small>
            </article>

          </div>


          <div className="signals-layout">

            <section className="signals-main-panel">

              <div className="signals-panel-header">
                <div>
                  <span>LIVE FEED</span>
                  <h2>Active Signals</h2>
                </div>

                <div className="signals-live-badge">
                  <span />
                  Waiting
                </div>
              </div>


              <div className="signals-empty">

                <div className="signals-empty-icon">
                  ↗
                </div>

                <h3>No active signals yet</h3>

                <p>
                  Live trading signals will appear here once
                  the Tradxa signal backend is connected.
                </p>

                <div className="signals-empty-tags">
                  <span>Entry</span>
                  <span>Stop Loss</span>
                  <span>Take Profit</span>
                  <span>Risk</span>
                </div>

              </div>

            </section>


            <aside className="signals-watchlist">

              <div className="signals-panel-header">
                <div>
                  <span>WATCHLIST</span>
                  <h2>Markets</h2>
                </div>

                <small>12 instruments</small>
              </div>


              <div className="signals-market-list">

                {watchedMarkets.map((symbol, index) => (
                  <div
                    className="signals-market-row"
                    key={symbol}
                  >
                    <div>
                      <span className="signals-market-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <strong>{symbol}</strong>
                    </div>

                    <span className="signals-market-waiting">
                      Monitoring
                    </span>
                  </div>
                ))}

              </div>

            </aside>

          </div>


          <div className="signals-info-grid">

            <article>
              <span>01</span>
              <h3>Market Analysis</h3>
              <p>
                Technical market context and directional bias
                for supported instruments.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Trade Setup</h3>
              <p>
                Structured entry, stop loss and target levels
                when a valid setup is available.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Performance</h3>
              <p>
                Closed trade history and signal performance
                will be tracked transparently.
              </p>
            </article>

          </div>


          <p className="signals-disclaimer">
            Trading involves risk. Signals and market analysis
            are provided for informational purposes and are not
            financial advice.
          </p>

        </div>
      </section>

    </main>
  )
}

export default Signals