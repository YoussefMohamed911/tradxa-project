import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import './MarketBar.css'

const marketGroups = [
  'all',
  'metals',
  'forex',
  'energy',
  'stocks',
]

const markets = [
  {
    symbol: 'XAU/USD',
    nameKey: 'market.instruments.gold',
    price: '3,625.40',
    change: '+0.42%',
    group: 'metals',
    direction: 'up',
  },
  {
    symbol: 'XAG/USD',
    nameKey: 'market.instruments.silver',
    price: '42.18',
    change: '+1.12%',
    group: 'metals',
    direction: 'up',
  },
  {
    symbol: 'EUR/GBP',
    nameKey: 'market.instruments.euroPound',
    price: '0.8621',
    change: '+0.15%',
    group: 'forex',
    direction: 'up',
  },
  {
    symbol: 'EUR/JPY',
    nameKey: 'market.instruments.euroYen',
    price: '159.42',
    change: '-0.11%',
    group: 'forex',
    direction: 'down',
  },
  {
    symbol: 'USOIL',
    nameKey: 'market.instruments.wti',
    price: '68.32',
    change: '-0.28%',
    group: 'energy',
    direction: 'down',
  },
  {
    symbol: 'UKOIL',
    nameKey: 'market.instruments.brent',
    price: '71.54',
    change: '+0.16%',
    group: 'energy',
    direction: 'up',
  },
  {
    symbol: 'AAPL',
    nameKey: 'market.instruments.apple',
    price: '229.15',
    change: '+0.32%',
    group: 'stocks',
    direction: 'up',
  },
  {
    symbol: 'NVDA',
    nameKey: 'market.instruments.nvidia',
    price: '118.90',
    change: '+1.08%',
    group: 'stocks',
    direction: 'up',
  },
]

function MarketBar() {
  const { t } = useTranslation()
  const [activeGroup, setActiveGroup] =
    useState('all')

  const filteredMarkets =
    activeGroup === 'all'
      ? markets
      : markets.filter(
          (market) =>
            market.group === activeGroup
        )

  const movingMarkets = [
    ...filteredMarkets,
    ...filteredMarkets,
    ...filteredMarkets,
  ]

  return (
    <section className="market-section">
      <div className="container">
        <div className="market-shell">

          <div className="market-header-row">
            <div className="market-tabs-row">

              {marketGroups.map((group) => (
                <button
                  key={group}
                  type="button"
                  className={`market-tab-btn ${
                    activeGroup === group
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveGroup(group)
                  }
                >
                  {t(`market.${group}`)}
                </button>
              ))}

            </div>
          </div>

          <div className="market-tape">
            <div className="market-tape-track">

              {movingMarkets.map(
                (market, index) => (
                  <article
                    className="market-tape-item"
                    key={`${market.symbol}-${index}`}
                  >

                    <div className="market-main-data">

                      <div className="market-symbol-row">
                        <span className="market-symbol">
                          {market.symbol}
                        </span>

                        <span
                          className={`market-direction-dot ${market.direction}`}
                        />
                      </div>

                      <strong className="market-price">
                        {market.price}
                      </strong>

                      <div className="market-meta">

                        <span className="market-name">
                          {t(market.nameKey)}
                        </span>

                        <span
                          className={`market-change ${market.direction}`}
                        >
                          {market.change}
                        </span>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default MarketBar