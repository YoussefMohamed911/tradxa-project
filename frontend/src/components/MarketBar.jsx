import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import './MarketBar.css'

const TRADINGVIEW_SCRIPT_ID = 'tradxa-tradingview-ticker-script'
const TRADINGVIEW_SCRIPT_SRC =
  'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js'

const SYMBOLS = [
  'OANDA:XAUUSD',
  'OANDA:XAGUSD',
  'FX:EURUSD',
  'FX:GBPUSD',
  'FX:USDJPY',
  'TVC:USOIL',
  'BITSTAMP:BTCUSD',
  'BITSTAMP:ETHUSD',
  'FOREXCOM:SPXUSD',
  'FOREXCOM:NSXUSD',
]

function loadTradingViewScript() {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TRADINGVIEW_SCRIPT_ID)

    if (existingScript) {
      if (customElements.get('tv-ticker-tape')) {
        resolve()
        return
      }

      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = TRADINGVIEW_SCRIPT_ID
    script.type = 'module'
    script.src = TRADINGVIEW_SCRIPT_SRC
    script.async = true

    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', reject, { once: true })

    document.head.appendChild(script)
  })
}

function MarketBar() {
  const { i18n } = useTranslation()
  const containerRef = useRef(null)

  const [status, setStatus] = useState('loading')

  const isArabic = i18n.language?.startsWith('ar')
  const locale = isArabic ? 'ar' : 'en'

  const isDark =
    document.documentElement.getAttribute('data-theme') !== 'light'

  useEffect(() => {
    let cancelled = false

    const mountWidget = async () => {
      setStatus('loading')

      try {
        await loadTradingViewScript()

        if (cancelled || !containerRef.current) return

        containerRef.current.innerHTML = ''

        const widget = document.createElement('tv-ticker-tape')

        widget.setAttribute('symbols', SYMBOLS.join(','))
        widget.setAttribute('locale', locale)
        widget.setAttribute('theme', isDark ? 'dark' : 'light')       
        widget.setAttribute('transparent', '')
        widget.setAttribute('display-mode', 'adaptive')

        containerRef.current.appendChild(widget)

        if (!cancelled) {
          setStatus('ready')
        }
      } catch (error) {
        console.error('TradingView ticker failed to load:', error)

        if (!cancelled) {
          setStatus('error')
        }
      }
    }

    mountWidget()

    return () => {
      cancelled = true

      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [locale, isDark])

  return (
    <section className="market-section">
      <div className="container">
        <div className="market-shell">

          {status === 'loading' && (
            <div className="market-widget-state">
              Loading live market data...
            </div>
          )}

          {status === 'error' && (
            <div className="market-widget-state market-widget-error">
              Live market data is temporarily unavailable.
            </div>
          )}

          <div
  ref={containerRef}
  className={`market-widget-container ${
    status === 'ready' ? 'is-ready' : ''
  }`}
  onClickCapture={(event) => {
    event.preventDefault()
    event.stopPropagation()
  }}
/>



        </div>
      </div>
    </section>
  )
}

export default MarketBar