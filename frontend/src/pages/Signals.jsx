import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../Lib/supabase'
import './signals.css'

const markets = [
  ['eurusd', 'EUR/USD'],
  ['usdchf', 'USD/CHF'],
  ['gbpusd', 'GBP/USD'],
  ['usdjpy', 'USD/JPY'],
  ['usdcad', 'USD/CAD'],
  ['audusd', 'AUD/USD'],
  ['eurjpy', 'EUR/JPY'],
  ['nzdusd', 'NZD/USD'],
  ['gbpchf', 'GBP/CHF'],
]

let savedSnapshot = null
let pendingRequest = null

async function loadSnapshot() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    savedSnapshot = null
    throw new Error('auth')
  }

  const userId = session.user.id

  if (
    savedSnapshot?.userId === userId &&
    Date.now() - savedSnapshot.savedAt < 60000
  ) {
    return savedSnapshot.data
  }

  if (pendingRequest?.userId === userId) {
    return pendingRequest.promise
  }

  const promise = (async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const { data, error } = await supabase
        .from('tradxa_signals_cache')
        .select('payload, fetched_at')
        .eq('id', 'foresignal')
        .abortSignal(controller.signal)
        .maybeSingle()

      if (error) throw error
      if (!data) throw new Error('empty')

      const items = data.payload?.items

      if (
        !Array.isArray(items) ||
        items.length !== 9 ||
        !Number.isFinite(Date.parse(data.fetched_at)) ||
        !markets.every(([ticker]) =>
          items.filter((item) => item.ticker === ticker).length === 1
        )
      ) {
        throw new Error('invalid')
      }

      savedSnapshot = {
        userId,
        data,
        savedAt: Date.now(),
      }

      return data
    } finally {
      clearTimeout(timeout)
    }
  })()

  pendingRequest = { userId, promise }

  try {
    return await promise
  } finally {
    if (pendingRequest?.promise === promise) {
      pendingRequest = null
    }
  }
}

function Signals() {
  const { i18n } = useTranslation()
  const ar = (i18n.resolvedLanguage || i18n.language || 'en')
    .startsWith('ar')

  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [now, setNow] = useState(Date.now())

  const text = (english, arabic) => ar ? arabic : english

  useEffect(() => {
    let mounted = true
    let busy = false

    async function refresh() {
      if (busy || document.hidden) return

      busy = true

      try {
        const data = await loadSnapshot()

        if (mounted) {
          setSnapshot(data)
          setError('')
          setNow(Date.now())
        }
      } catch (err) {
        if (mounted) {
          setError(
            ['auth', 'empty'].includes(err.message)
              ? err.message
              : 'failed'
          )
        }
      } finally {
        busy = false
        if (mounted) setLoading(false)
      }
    }

    refresh()

    const polling = setInterval(refresh, 120000)
    const clock = setInterval(() => setNow(Date.now()), 30000)

    document.addEventListener('visibilitychange', refresh)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        savedSnapshot = null
        if (mounted) setSnapshot(null)
      }
    })

    return () => {
      mounted = false
      clearInterval(polling)
      clearInterval(clock)
      document.removeEventListener('visibilitychange', refresh)
      subscription.unsubscribe()
    }
  }, [retry])

  const dateText = (value) => {
    if (!value) return '—'

    const date = new Date(value)
    if (!Number.isFinite(date.getTime())) return '—'

    return new Intl.DateTimeFormat(ar ? 'ar-EG' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date)
  }

  const stale = Boolean(
    snapshot && now - Date.parse(snapshot.fetched_at) > 360000
  )

  const graph = snapshot?.payload?.graph
  const hasGraph =
    typeof graph?.image === 'string' &&
    graph.image.startsWith('data:image/png;base64,')

  const graphStale =
    hasGraph &&
    (
      !Number.isFinite(Date.parse(graph.fetchedAt)) ||
      now - Date.parse(graph.fetchedAt) > 1200000
    )

  const statuses = {
    buy: text('BUY', 'شراء'),
    sell: text('SELL', 'بيع'),
    filled: text('CLOSED', 'مغلقة'),
    cancelled: text('CANCELLED', 'ملغاة'),
    waiting: text('PENDING RELEASE', 'في انتظار الإتاحة'),
    expired: text('EXPIRED', 'انتهت المدة'),
  }

  const errorText =
    error === 'auth'
      ? text('Sign in to view signals.', 'سجّل الدخول لعرض الإشارات.')
      : error === 'empty'
        ? text(
            'Waiting for the first server update.',
            'في انتظار أول تحديث من السيرفر.'
          )
        : text(
            'Unable to refresh. Any displayed data is the last saved version.',
            'تعذّر التحديث. البيانات الظاهرة هي آخر نسخة محفوظة.'
          )

  return (
    <main className="signals-page" dir={ar ? 'rtl' : 'ltr'}>
      <section className="signals-hero">
        <div className="container signals-hero-inner">
          <div>
            <span className="signals-eyebrow">
              TRADXA INTELLIGENCE
            </span>

            <h1>{text('Trading Signals', 'إشارات التداول')}</h1>

            <p>
              {text(
                'Nine currency pairs. Entry levels, targets and recent results in one place.',
                'تسعة أزواج عملات. مستويات الدخول والأهداف والنتائج الأخيرة في مكان واحد.'
              )}
            </p>
          </div>

          <div className="signals-engine-status">
            <span
              className={`signals-status-dot ${
                !snapshot || stale || error ? 'is-pending' : ''
              }`}
            />

            <div>
              <strong>
                {text('Last data update', 'آخر تحديث للبيانات')}
              </strong>
              <span>{dateText(snapshot?.fetched_at)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="signals-content">
        <div className="container">
          <div className="signals-section-heading">
            <div>
              <span className="signals-eyebrow">
                {text('CURRENCY SIGNALS', 'إشارات العملات')}
              </span>
              <h2>{text('Market overview', 'نظرة على السوق')}</h2>
            </div>

            <span className="signals-count">
              {text('09 PAIRS', '٩ أزواج')}
            </span>
          </div>

          {(error || stale) && (
            <div className="signals-alert" role="status">
              <span>
                {error
                  ? errorText
                  : text(
                      'Data updates are delayed. Check the last update time.',
                      'تحديث البيانات متأخر. راجع وقت آخر تحديث.'
                    )}
              </span>

              {error && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setLoading(true)
                    setRetry((value) => value + 1)
                  }}
                >
                  {text('Retry', 'إعادة المحاولة')}
                </button>
              )}
            </div>
          )}

          <div className="signals-cards-grid" aria-busy={loading}>
            {markets.map(([ticker, symbol], index) => {
              const item = snapshot?.payload.items.find(
                (signal) => signal.ticker === ticker
              )

              const expired =
                item &&
                ['buy', 'sell'].includes(item.status) &&
                item.till &&
                Date.parse(item.till) <= now

              const status = expired ? 'expired' : item?.status
              const closed = status === 'filled'

              const rows = closed
                ? [
                    [text('Bought at', 'سعر الشراء'), item.bought],
                    [text('Sold at', 'سعر البيع'), item.sold],
                    [text('Result · pips', 'النتيجة · نقطة'), item.pips, true],
                  ]
                : [
                    [text('Entry price', 'سعر الدخول'), item?.entry],
                    [text('Take profit', 'الهدف'), item?.takeProfit],
                    [text('Stop loss', 'وقف الخسارة'), item?.stopLoss],
                  ]

              return (
                <article
                  className={`signals-trade-card state-${status || 'empty'}`}
                  key={ticker}
                >
                  <header className="signals-card-header">
                    <div className="signals-pair-mark" aria-hidden="true">
                      {ticker.slice(0, 3).toUpperCase()}
                    </div>

                    <h3 dir="ltr">{symbol}</h3>

                    <span className="signals-card-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </header>

                  {!item ? (
                    <div className="signals-card-placeholder" role="status">
                      {loading
                        ? text('Loading signals…', 'جاري تحميل الإشارات…')
                        : text('No data available', 'لا توجد بيانات متاحة')}
                    </div>
                  ) : (
                    <>
                      <div className={`signals-direction state-${status}`}>
                        {status === 'buy' && <span aria-hidden="true">↗</span>}
                        {status === 'sell' && <span aria-hidden="true">↘</span>}
                        {statuses[status] || '—'}
                      </div>

                      {status === 'waiting' ? (
                        <div className="signals-waiting-content">
                          <span aria-hidden="true">◷</span>
                          <p>
                            {text(
                              'Waiting for the source to release this signal.',
                              'في انتظار إتاحة التوصية من المصدر.'
                            )}
                          </p>
                        </div>
                      ) : (
                        <dl className="signals-levels">
                          {rows.map(([label, value, isResult]) => (
                            <div key={label}>
                              <dt>{label}</dt>
                              <dd
                                dir="ltr"
                                className={
                                  isResult && value != null
                                    ? Number(value) >= 0
                                      ? 'signals-positive'
                                      : 'signals-negative'
                                    : ''
                                }
                              >
                                {value == null
                                  ? '—'
                                  : isResult && Number(value) > 0
                                    ? `+${value}`
                                    : value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}

                      <footer className="signals-card-footer">
                        <div>
                          <span>{text('From', 'من')}</span>
                          <time dateTime={item.from}>
                            {dateText(item.from)}
                          </time>
                        </div>

                        {item.till && (
                          <div>
                            <span>{text('Until', 'حتى')}</span>
                            <time dateTime={item.till}>
                              {dateText(item.till)}
                            </time>
                          </div>
                        )}
                      </footer>
                    </>
                  )}
                </article>
              )
            })}
          </div>

          <section className="signals-results-panel">
            <div className="signals-panel-header">
              <div>
                <span>{text('PERFORMANCE', 'الأداء')}</span>
                <h2>{text('Recent results', 'النتائج الأخيرة')}</h2>
              </div>

              <span className="signals-count">
                {text('All 9 pairs', 'كل الأزواج التسعة')}
              </span>
            </div>

            {hasGraph ? (
              <>
                <div className="signals-chart-scroll">
                  <img
                    className="signals-chart-image"
                    src={graph.image}
                    width="934"
                    height="420"
                    alt={text(
                      'Source-reported historical gains and losses in pips.',
                      'الأرباح والخسائر التاريخية بالنقاط كما يعرضها المصدر.'
                    )}
                  />
                </div>

                <p className="signals-chart-date">
                  {text('Chart updated', 'تحديث الجراف')}: {dateText(graph.fetchedAt)}
                  {graphStale && text(' · Update delayed', ' · التحديث متأخر')}
                </p>
              </>
            ) : (
              <div className="signals-chart-empty">
                {text(
                  'The chart is not available yet.',
                  'الجراف غير متاح حاليًا.'
                )}
              </div>
            )}

            <p className="signals-results-note">
              {text(
                'Source-reported results are hypothetical, not verified returns from executed trades. Past performance does not guarantee future results.',
                'النتائج المعلنة من المصدر افتراضية، وليست عوائد موثقة لصفقات منفذة. الأداء السابق لا يضمن النتائج المستقبلية.'
              )}
            </p>
          </section>

          <p className="signals-disclaimer">
            {text(
              'Public signals may be delayed. Times follow your device timezone. This page displays information only and does not execute trades.',
              'قد تتأخر إتاحة التوصيات العامة. الأوقات حسب المنطقة الزمنية لجهازك. الصفحة لعرض المعلومات فقط ولا تنفذ صفقات.'
            )}
          </p>
        </div>
      </section>
    </main>
  )
}

export default Signals