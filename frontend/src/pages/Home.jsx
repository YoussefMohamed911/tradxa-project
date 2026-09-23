import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import MarketBar from "../components/MarketBar";
import NewsTicker from "../components/NewsTicker";

import { supabase } from '../lib/supabase'
import "./Home.css";

/* =========================
   MARKET NEWS
========================= */

const marketNews = [
  {
    id: 1,
    category: "forex",
    labelKey: "homeNews.categories.forex",
    titleKey: "homeNews.headlines.forex",
    minutes: 8,
  },
  {
    id: 2,
    category: "metals",
    labelKey: "homeNews.categories.metals",
    titleKey: "homeNews.headlines.metals",
    minutes: 14,
  },
  {
    id: 3,
    category: "crypto",
    labelKey: "homeNews.categories.crypto",
    titleKey: "homeNews.headlines.crypto",
    minutes: 21,
  },
  {
    id: 4,
    category: "oil",
    labelKey: "homeNews.categories.oil",
    titleKey: "homeNews.headlines.oil",
    minutes: 28,
  },
  {
    id: 5,
    category: "stocks",
    labelKey: "homeNews.categories.stocks",
    titleKey: "homeNews.headlines.stocks",
    minutes: 35,
  },
  {
    id: 6,
    category: "commodities",
    labelKey: "homeNews.categories.commodities",
    titleKey: "homeNews.headlines.commodities",
    minutes: 42,
  },
];

/* =========================
   MARKET ANALYSIS
========================= */

const marketAnalysis = [
  {
    id: 1,
    symbol: "XAU/USD",
    analysisKey: "homeAnalysis.placeholders.1",
  },
  {
    id: 2,
    symbol: "BTC/USD",
    analysisKey: "homeAnalysis.placeholders.2",
  },
  {
    id: 3,
    symbol: "USOIL",
    analysisKey: "homeAnalysis.placeholders.3",
  },
  {
    id: 4,
    symbol: "USD30",
    analysisKey: "homeAnalysis.placeholders.4",
  },
  {
    id: 5,
    symbol: "DAX/USD",
    analysisKey: "homeAnalysis.placeholders.5",
  },
  {
    id: 6,
    symbol: "EUR/USD",
    analysisKey: "homeAnalysis.placeholders.6",
  },
  {
    id: 7,
    symbol: "GBP/USD",
    analysisKey: "homeAnalysis.placeholders.7",
  },
  {
    id: 8,
    symbol: "AUD/USD",
    analysisKey: "homeAnalysis.placeholders.8",
  },
  {
    id: 9,
    symbol: "NZD/USD",
    analysisKey: "homeAnalysis.placeholders.9",
  },
  {
    id: 10,
    symbol: "USD/CAD",
    analysisKey: "homeAnalysis.placeholders.10",
  },
  {
    id: 11,
    symbol: "USD/CHF",
    analysisKey: "homeAnalysis.placeholders.11",
  },
  {
    id: 12,
    symbol: "USD/JPY",
    analysisKey: "homeAnalysis.placeholders.12",
  },
];

/* =========================
   CALENDAR DATA
========================= */



const impactDots = {
  high: 3,
  medium: 2,
  low: 1,
};

const allImpacts = ["high", "medium", "low"];

/* =========================
   HOME
========================= */

const displayCalendarValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return value;
};

function Home() {
  const { t } = useTranslation();

  const [calendarEvents, setCalendarEvents] =
  useState([])

const loadTodayCalendar = async () => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('economic_events')
    .select(`
      id,
      event_time,
      country,
      currency,
      event_name,
      impact,
      actual,
      forecast,
      previous
    `)
    .gte('event_time', start.toISOString())
    .lte('event_time', end.toISOString())
    .order('event_time', {
      ascending: true,
    })

  if (error) {
    console.error(
      'Home calendar error:',
      error
    )
    return
  }

  setCalendarEvents(data || [])
}

useEffect(() => {
  loadTodayCalendar()

  const channel = supabase
    .channel('tradxa-home-calendar')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'economic_events',
      },
      () => {
        loadTodayCalendar()
      }
    )
    .subscribe()

  const fallback = setInterval(
    loadTodayCalendar,
    60000
  )

  return () => {
    clearInterval(fallback)
    supabase.removeChannel(channel)
  }
}, [])


  const [impactFilters, setImpactFilters] = useState(allImpacts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef(null);

  const toggleImpactFilter = (impact) => {
    setImpactFilters((current) => {
      if (current.includes(impact)) {
        return current.filter((item) => item !== impact);
      }

      return [...current, impact];
    });
  };

  const resetImpactFilters = () => {
    setImpactFilters(allImpacts);
  };

  const filteredCalendarEvents = calendarEvents.filter((event) =>
    impactFilters.includes(event.impact),
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <main className="home-page">
      <MarketBar />

      <NewsTicker />

      {/* =========================
          LATEST NEWS
      ========================= */}

      <section className="latest-news-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>{t("home.latestNews")}</h2>
            </div>

            <Link to="/news" className="section-view-link">
              {t("home.viewAllNews")}
              <span>→</span>
            </Link>
          </div>

          <div className="latest-news-grid home-news-six-grid">
            {marketNews.map((item) => (
              <article
                key={item.id}
                className={`market-news-card home-news-card news-${item.category}`}
              >
                <div className="news-card-top">
                  <span className="headline-category">{t(item.labelKey)}</span>

                  <span className="news-card-time">
                    {t("common.minutesAgo", {
                      count: item.minutes,
                    })}
                  </span>
                </div>

                <h3>{t(item.titleKey)}</h3>

                <div className="news-card-footer">
                  <span>{t("homeNews.marketNews")}</span>

                  <Link
                    to={`/news?category=${item.category}`}
                    className="news-action-btn"
                    aria-label={`Open ${t(item.labelKey)} news`}
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
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          MARKET ANALYSIS
      ========================= */}

      <section className="home-analysis-section">
        <div className="container">
          <div className="section-heading analysis-heading">
            <div>
              <span className="section-eyebrow">
                {t("homeAnalysis.eyebrow")}
              </span>

              <h2>{t("homeAnalysis.title")}</h2>

              <p className="analysis-description">
                {t("homeAnalysis.description")}
              </p>
            </div>
          </div>

          <div className="home-analysis-grid">
            {marketAnalysis.map((item) => (
              <article key={item.id} className="home-analysis-card">
                <div className="analysis-card-top">
                  <span className="analysis-symbol">{item.symbol}</span>

                  <span className="analysis-source">Telegram</span>
                </div>

                <p className="analysis-card-text">
                  {t(item.analysisKey, { symbol: item.symbol })}
                </p>

                <div className="analysis-card-bottom">
                  <span>{t("homeAnalysis.latestAnalysis")}</span>

                  <span className="analysis-live">
                    <span className="analysis-live-dot" />
                    {t("homeAnalysis.live")}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          ECONOMIC CALENDAR
      ========================= */}

      <section className="calendar-section">
        <div className="container">
          <div className="section-heading calendar-heading">
            <div>
              <span className="section-eyebrow">{t("home.globalEvents")}</span>

              <h2>{t("home.economicCalendar")}</h2>
            </div>

            <Link to="/calendar" className="calendar-view-btn">
              <span>{t("home.viewCalendar")}</span>
              <span className="calendar-view-arrow">→</span>
            </Link>
          </div>

          <div className="calendar-filter-wrapper" ref={filterRef}>
            <button
              type="button"
              className={`calendar-filter-trigger ${
                isFilterOpen ? "open" : ""
              }`}
              onClick={() => setIsFilterOpen((current) => !current)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6h16" />
                <path d="M7 12h10" />
                <path d="M10 18h4" />
              </svg>

              <span>{t("calendar.filter")}</span>

              {impactFilters.length < 3 && (
                <span className="filter-count">{impactFilters.length}</span>
              )}

              <span className={`filter-chevron ${isFilterOpen ? "open" : ""}`}>
                ▾
              </span>
            </button>

            {isFilterOpen && (
              <div className="calendar-filter-menu">
                <div className="filter-menu-header">
                  <div>
                    <strong>{t("calendar.filterByImpact")}</strong>

                    <span>{t("calendar.selectMultiple")}</span>
                  </div>

                  <button
                    type="button"
                    className="filter-reset-btn"
                    onClick={resetImpactFilters}
                  >
                    {t("calendar.reset")}
                  </button>
                </div>

                <div className="filter-menu-options">
                  {allImpacts.map((impact) => {
                    const checked = impactFilters.includes(impact);

                    return (
                      <label
                        key={impact}
                        className={`filter-option ${impact} ${
                          checked ? "selected" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleImpactFilter(impact)}
                        />

                        <span className="custom-checkbox">
                          {checked ? "✓" : ""}
                        </span>

                        <span className={`filter-impact-dot ${impact}`} />

                        <span className="filter-option-text">
                          {t(`calendar.${impact}`)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="calendar-table-wrap">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th>{t("calendar.time")}</th>
                  <th>{t("calendar.currency")}</th>
                  <th>{t("calendar.impact")}</th>
                  <th>{t("calendar.event")}</th>
                  <th>{t("calendar.actual")}</th>
                  <th>{t("calendar.forecast")}</th>
                  <th>{t("calendar.previous")}</th>
                </tr>
              </thead>

            <tbody>
  {filteredCalendarEvents.length > 0 ? (
    filteredCalendarEvents.map((event) => (
      <tr key={event.id}>

        {/* TIME */}
        <td className="calendar-time">
          {new Date(event.event_time).toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          )}
        </td>

        {/* CURRENCY */}
        <td>
          <div className="currency-cell">
            <img
              src={
                event.country
                  ? `https://flagcdn.com/w40/${event.country.toLowerCase()}.png`
                  : ''
              }
              alt={`${event.currency} flag`}
              className="currency-flag"
            />

            <strong>
              {event.currency}
            </strong>
          </div>
        </td>

        {/* IMPACT */}
        <td>
          <div
            className={`impact impact-${event.impact}`}
          >
            <div className="impact-dots">
              {Array.from({
                length:
                  impactDots[event.impact] || 1,
              }).map((_, dotIndex) => (
                <span
                  className="impact-dot"
                  key={dotIndex}
                />
              ))}
            </div>

            <span className="impact-text">
              {t(`calendar.${event.impact}`)}
            </span>
          </div>
        </td>

        {/* EVENT */}
        <td className="calendar-event">
          {event.event_name}
        </td>

        {/* ACTUAL */}
        <td className="calendar-actual">
          {displayCalendarValue(event.actual)}
        </td>

        {/* FORECAST */}
        <td>
          {displayCalendarValue(
            event.forecast
          )}
        </td>

        {/* PREVIOUS */}
        <td>
          {displayCalendarValue(
            event.previous
          )}
        </td>

      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan="7"
        className="calendar-empty"
      >
        {t('calendar.noEvents')}
      </td>
    </tr>
  )}
</tbody>

            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
