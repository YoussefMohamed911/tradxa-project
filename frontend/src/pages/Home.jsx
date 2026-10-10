import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HomeMarketNews from "../components/MarketNews";
import MarketBar from "../components/MarketBar";
import NewsTicker from "../components/NewsTicker";
import { supabase } from "../Lib/supabase";

import "./Home.css";

/* MARKET ANALYSIS */

const marketAnalysis = [
  { id: 1, symbol: "XAU/USD" },
  { id: 2, symbol: "BTC/USD" },
  { id: 3, symbol: "USOIL" },
  { id: 4, symbol: "USD30", dataSymbol: "US30" },
  { id: 5, symbol: "DAX/USD" },
  { id: 6, symbol: "EUR/USD" },
  { id: 7, symbol: "GBP/USD" },
  { id: 8, symbol: "AUD/USD" },
  { id: 9, symbol: "NZD/USD" },
  { id: 10, symbol: "USD/CAD" },
  { id: 11, symbol: "USD/CHF" },
  { id: 12, symbol: "USD/JPY" },
];

const impactDots = {
  high: 3,
  medium: 2,
  low: 1,
};

const allImpacts = ["high", "medium", "low"];

const displayCalendarValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
};

/* ANALYSIS PARSER */

function parseAnalysis(body) {
  const text = String(body ?? "")
    .replace(/[٠-٩]/g, (c) => String("٠١٢٣٤٥٦٧٨٩".indexOf(c)))
    .replace(/[۰-۹]/g, (c) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)))
    .replace(/٫/g, ".")
    .replace(/٬/g, ",")
    .replace(/[*_`\\]/g, "")
    .replace(/[\u200e\u200f\u061c]/g, "");

  const numbers = (value) =>
    value?.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) ?? [];

  const direction =
    text.match(
      /(?:الاتجاه|trend|direction)\s*[:：]\s*([^\n•]+)/i
    )?.[1] ?? "";

  const trend = /هابط|هبوط|bearish|down/i.test(direction)
    ? "bearish"
    : /صاعد|صعود|bullish|up/i.test(direction)
      ? "bullish"
      : /محايد|عرضي|neutral|sideways/i.test(direction)
        ? "neutral"
        : "unknown";

  const price = numbers(
    text.match(
      /(?:السعر الحالي|السعر وقت التحليل|current price|price)\s*[:：]\s*([^\n•]+)/i
    )?.[1]
  )[0];

  const targets = numbers(
    text.match(
      /(?:الأهداف|الاهداف|targets)[^:\n•]*[:：]\s*([^\n•]+)/i
    )?.[1]
  ).slice(0, 2);

  const pivot = numbers(
    text.match(
      /(?:ونعتمد مستوى|نعتمد مستوى|المستوى الفاصل|key level|pivot)\s*[:：]?\s*([\d.,]+)/i
    )?.[1]
  )[0];

  const condition =
    text.match(
      /(?:والحذر|الحذر|if\b|a break\b)[\s\S]*?(?=تنبيه|disclaimer|#|@|$)/i
    )?.[0] ?? "";

  const side = /أعلى|اعلى|فوق|above/i.test(condition)
    ? "above"
    : /أسفل|اسفل|تحت|below/i.test(condition)
      ? "below"
      : null;

  const alternate = numbers(
    condition.match(
      /(?:لمستوى|لمستويات|نحو|towards?|targets?)\s*[:：]?\s*([\s\S]*)/i
    )?.[1]
  ).slice(0, 2);

  const date = text.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1];

  const time = text.match(
    /\b(\d{1,2}:\d{2}(?:\s*[AP]M)?)\b/i
  )?.[1];

  const timeframe = text.match(
    /\b(?:M(?:1|5|15|30)|H(?:1|2|4|6|8|12)|D1|W1|MN1)\b/i
  )?.[0];

  return {
    trend,
    price,
    targets,
    pivot,
    side,
    alternate,
    date,
    time,
    timeframe,
  };
}

function publishedAge(value, now, isArabic) {
  if (!value || !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
    return null;
  }

  const stamp = Date.parse(value);

  if (!Number.isFinite(stamp) || stamp > now) {
    return null;
  }

  const minutes = Math.floor((now - stamp) / 60000);

  const unit =
    minutes >= 1440 ? "day" : minutes >= 60 ? "hour" : "minute";

  const count =
    unit === "day"
      ? Math.floor(minutes / 1440)
      : unit === "hour"
        ? Math.floor(minutes / 60)
        : minutes;

  return new Intl.RelativeTimeFormat(isArabic ? "ar" : "en", {
    numeric: "auto",
  }).format(-count, unit);
}

/* ANALYSIS CARD */

function AnalysisCard({ item, analysis, status, isArabic, now }) {
  const label = (en, ar) => (isArabic ? ar : en);
  const data = parseAnalysis(analysis?.body);

  const trendNames = {
    bearish: label("Bearish", "هابط"),
    bullish: label("Bullish", "صاعد"),
    neutral: label("Neutral", "محايد"),
    unknown: label("Unspecified", "غير محدد"),
  };

  const arrows = {
    bearish: "↘",
    bullish: "↗",
    neutral: "→",
    unknown: "—",
  };

  const age = publishedAge(analysis?.published_at, now, isArabic);

  const empty =
    status === "loading"
      ? label("Loading analysis…", "جاري تحميل التحليل…")
      : status === "error"
        ? label(
            "Unable to load. Retrying…",
            "تعذّر التحميل، جاري إعادة المحاولة…"
          )
        : label("Waiting for analysis", "في انتظار التحليل");

  return (
    <article
      className={`home-analysis-card analysis-v2 trend-${
        analysis ? data.trend : "unknown"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="analysis-card-top">
        <span className="analysis-symbol" dir="ltr">
          {item.symbol}
        </span>

        {analysis && (
          <span className="analysis-trend">
            <span aria-hidden="true" dir="ltr">
              {arrows[data.trend]}
            </span>
            {trendNames[data.trend]}
          </span>
        )}
      </div>

      {analysis ? (
        <>
          <div className="analysis-date-block">
            <span className="analysis-field-label">
              {label(
                "Analysis time · source time",
                "وقت التحليل · بتوقيت المصدر"
              )}
            </span>

            <div className="analysis-date-line">
              {data.date ? (
                <time dateTime={data.date} dir="ltr">
                  {data.date}
                  {data.time ? ` · ${data.time}` : ""}
                </time>
              ) : (
                <span>{label("Not provided", "غير متاح")}</span>
              )}

              {data.timeframe && (
                <span className="analysis-timeframe" dir="ltr">
                  {data.timeframe}
                </span>
              )}
            </div>
          </div>

          <div className="analysis-price-block">
            <span className="analysis-field-label">
              {label("Price at analysis", "السعر وقت التحليل")}
            </span>
            <strong dir="ltr">{data.price ?? "—"}</strong>
          </div>

          <div className="analysis-targets">
            {[0, 1].map((index) => (
              <div className="analysis-target" key={index}>
                <span className="analysis-field-label">
                  {label(`Target ${index + 1}`, `الهدف ${index + 1}`)}
                </span>
                <strong dir="ltr">
                  {data.targets[index] ?? "—"}
                </strong>
              </div>
            ))}
          </div>

          <div className="analysis-pivot">
            <span>{label("Key level", "المستوى الفاصل")}</span>
            <strong dir="ltr">{data.pivot ?? "—"}</strong>
          </div>

          <div className="analysis-alternative">
            <span className="analysis-field-label">
              {label("Alternative scenario", "السيناريو البديل")}
            </span>

            {data.side && data.pivot && data.alternate.length ? (
              <p>
                {data.side === "above"
                  ? label("Break and hold above", "اختراق وثبات أعلى")
                  : label("Break and hold below", "كسر وثبات أسفل")}{" "}
                <bdi>{data.pivot}</bdi>

                <span className="analysis-alternative-values" dir="ltr">
                  {data.alternate.join(" → ")}
                </span>
              </p>
            ) : (
              <p>
                {label(
                  "Not provided in a supported format",
                  "غير متاح بصيغة قابلة للعرض"
                )}
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="analysis-empty" role="status">
          {empty}
        </p>
      )}

      <div className="analysis-card-bottom">
        <span>{label("Latest analysis", "آخر تحليل")}</span>

        {analysis && age && (
          <span title={analysis.published_at}>
            {label("Published ", "نُشر ")}
            {age}
          </span>
        )}
      </div>

      {analysis && status === "error" && (
        <p className="analysis-refresh-error" role="status">
          {label(
            "Refresh failed; showing saved analysis. Retrying…",
            "تعذّر التحديث؛ آخر تحليل متاح ظاهر. جاري إعادة المحاولة…"
          )}
        </p>
      )}
    </article>
  );
}

/* NEWS FEED */

function parseNewsFeed(xml) {
  const feedDocument = new DOMParser().parseFromString(
    xml,
    "application/xml"
  );

  if (
    feedDocument.querySelector("parsererror") ||
    !feedDocument.querySelector("rss channel")
  ) {
    throw new Error("Invalid news feed");
  }

  const seen = new Set();

  return Array.from(feedDocument.querySelectorAll("item"))
    .flatMap((item) => {
      const title = item.querySelector("title")?.textContent?.trim();
      const link = item.querySelector("link")?.textContent?.trim();
      const stamp = Date.parse(
        item.querySelector("pubDate")?.textContent ?? ""
      );

      let url;

      try {
        url = new URL(link);
      } catch {
        return [];
      }

      if (
        !title ||
        !Number.isFinite(stamp) ||
        url.protocol !== "https:" ||
        !["boursa.info", "www.boursa.info"].includes(url.hostname) ||
        seen.has(url.href)
      ) {
        return [];
      }

      seen.add(url.href);

      return [
        {
          title,
          link: url.href,
          publishedAt: new Date(stamp).toISOString(),
        },
      ];
    })
    .sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
    )
    .slice(0, 6);
}

/* LATEST MARKET NEWS */

function LatestMarketNews({ isArabic, now }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [stale, setStale] = useState(false);

  const label = (en, ar) => (isArabic ? ar : en);

  useEffect(() => {
    let stopped = false;
    let busy = false;
    let controller;

    async function load() {
      if (stopped || busy) return;

      busy = true;
      controller = new AbortController();

      const timeout = setTimeout(() => controller.abort(), 20000);

      try {
        const base = import.meta.env.VITE_SUPABASE_URL;

        if (!base) {
          throw new Error("Missing Supabase URL");
        }

        const response = await fetch(
          `${base}/functions/v1/boursa-news`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`News service: ${response.status}`);
        }

        const payload = await response.json();

        if (typeof payload.rss !== "string") {
          throw new Error("Missing feed");
        }

        const rows = parseNewsFeed(payload.rss);

        if (!rows.length) {
          throw new Error("No valid news received");
        }

        if (!stopped) {
          setItems(rows);
          setStale(Boolean(payload.stale));
          setStatus("ready");
        }
      } catch (error) {
        if (!stopped) {
          console.error("Home news error:", error.message);
          setStatus("error");
        }
      } finally {
        clearTimeout(timeout);
        busy = false;
      }
    }

    load();

    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, 300000);

    const visible = () => {
      if (!document.hidden) load();
    };

    document.addEventListener("visibilitychange", visible);

    return () => {
      stopped = true;
      clearInterval(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);

  return (
    <section
      className="latest-news-section"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <h2>{label("Latest Market News", "آخر أخبار الأسواق")}</h2>
            <p className="boursa-source-note">
              {label(
                "Source: Boursa.info · Arabic headlines",
                "المصدر: Boursa.info"
              )}
            </p>
          </div>

          <a
            href="https://boursa.info/category/أخبار-وآراء/"
            target="_blank"
            rel="noopener noreferrer"
            className="section-view-link"
          >
            {label("All source news", "كل أخبار المصدر")}
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        {items.length === 0 ? (
          <p className="boursa-news-status" role="status">
            {status === "loading"
              ? label("Loading market news…", "جاري تحميل الأخبار…")
              : label(
                  "News is temporarily unavailable. Retrying automatically.",
                  "الأخبار غير متاحة مؤقتًا. سنعيد المحاولة تلقائيًا."
                )}
          </p>
        ) : (
          <div className="latest-news-grid home-news-six-grid">
            {items.map((item) => (
              <article
                key={item.link}
                className="market-news-card home-news-card boursa-news-card"
              >
                <div className="news-card-top">
                  <span className="headline-category">
                    {label("Markets", "الأسواق")}
                  </span>

                  <time
                    className="news-card-time"
                    dateTime={item.publishedAt}
                    title={new Date(item.publishedAt).toLocaleString(
                      isArabic ? "ar-EG" : "en-GB"
                    )}
                  >
                    {publishedAge(item.publishedAt, now, isArabic) ??
                      new Date(item.publishedAt).toLocaleDateString(
                        isArabic ? "ar-EG" : "en-GB"
                      )}
                  </time>
                </div>

                <h3 lang="ar" dir="rtl">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.title}
                  </a>
                </h3>

                <div className="news-card-footer">
                  <span>Boursa.info</span>

                  <a
                    className="news-action-btn"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label(
                      "Read article",
                      "اقرأ الخبر"
                    )}: ${item.title}`}
                  >
                    ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {items.length > 0 && (status === "error" || stale) && (
          <p className="boursa-news-status" role="status">
            {label(
              "Refresh unavailable; showing previously loaded news.",
              "تعذّر التحديث؛ نعرض آخر أخبار تم تحميلها."
            )}
          </p>
        )}
      </div>
    </section>
  );
}

/* HOME */

function Home() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  const [analysisNow, setAnalysisNow] = useState(Date.now);
  const [analysisRows, setAnalysisRows] = useState([]);
  const [analysisStatus, setAnalysisStatus] = useState("loading");

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(false);

  const calendarRequestIdRef = useRef(0);
  const calendarEventsRef = useRef(calendarEvents);

  const [impactFilters, setImpactFilters] = useState(allImpacts);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnalysisNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  /* LOAD TELEGRAM ANALYSIS */

  useEffect(() => {
    let cancelled = false;
    let fetching = false;
    let controller;

    const loadAnalysis = async () => {
      if (cancelled || fetching) return;

      fetching = true;
      controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 15000);

      try {
        const { data, error } = await supabase
          .from("latest_market_analysis")
          .select("symbol,body,published_at")
          .abortSignal(controller.signal);

        if (cancelled) return;
        if (error) throw error;

        setAnalysisRows(data ?? []);
        setAnalysisStatus("ready");
      } catch (error) {
        if (!cancelled) {
          console.error("Home analysis error:", error.message);
          setAnalysisStatus("error");
        }
      } finally {
        clearTimeout(timeout);
        fetching = false;
      }
    };

    loadAnalysis();

    const timer = setInterval(() => {
      if (!document.hidden) {
        loadAnalysis();
      }
    }, 60000);

    const onVisible = () => {
      if (!document.hidden) {
        loadAnalysis();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const analysisBySymbol = new Map(
    analysisRows.map((row) => [row.symbol, row])
  );

  /* LOAD ECONOMIC CALENDAR */

  useEffect(() => {
    calendarEventsRef.current = calendarEvents;
  }, [calendarEvents]);

  useEffect(() => {
    let cancelled = false;

    let realtimeConnected = false;
    let refreshTimer;
    let refreshNeeded = false;
    const scheduleRefresh = () => {
      if (cancelled) return;
      refreshNeeded = true;
      if (document.hidden || refreshTimer) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = undefined;
        if (cancelled || document.hidden) return;
        refreshNeeded = false;
        loadTodayCalendar(false);
      }, 500);
    };
    const onCalendarVisible = () => {
      if (!document.hidden) scheduleRefresh();
    };
    document.addEventListener("visibilitychange", onCalendarVisible);

    const loadTodayCalendar = async (showLoading) => {
      const requestId = ++calendarRequestIdRef.current;

      if (showLoading) {
        setCalendarLoading(true);
        setCalendarError(false);
      }

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("economic_events")
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
        .gte("event_time", start.toISOString())
        .lte("event_time", end.toISOString())
        .order("event_time", {
          ascending: true,
        });

      if (cancelled || requestId !== calendarRequestIdRef.current) {
        return;
      }

      if (error) {
        console.error("Home calendar error:", error);

        if (showLoading || calendarEventsRef.current.length === 0) {
          setCalendarEvents([]);
          setCalendarError(true);
        }

        setCalendarLoading(false);
        return;
      }

      setCalendarError(false);
      setCalendarEvents(data || []);
      setCalendarLoading(false);
    };

    loadTodayCalendar(true);

    const channel = supabase
      .channel("tradxa-home-calendar")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "economic_events",
        },
        scheduleRefresh
      )
      .subscribe((status, err) => {
        realtimeConnected = status === "SUBSCRIBED";
        if (realtimeConnected) scheduleRefresh();
        if (cancelled) return;

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          if (err) {
            console.warn("Home calendar realtime status:", status, err);
          }
        }
      });

    const fallback = setInterval(() => {
      if (!document.hidden && (!realtimeConnected || refreshNeeded)) scheduleRefresh();
    }, 60000);

    return () => {
      cancelled = true;
      calendarRequestIdRef.current += 1;
      clearInterval(fallback);
      clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", onCalendarVisible);
      supabase.removeChannel(channel);
    };
  }, []);

  /* CALENDAR FILTER */

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
    impactFilters.includes(event.impact)
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

<HomeMarketNews />
      {/* MARKET ANALYSIS */}

      <section className="home-analysis-section">
        <div className="container">
          <div className="section-heading analysis-heading">
            <div>
              <span className="section-eyebrow">
                {t("homeAnalysis.eyebrow")}
              </span>
              <h2>{t("homeAnalysis.title")}</h2>
            </div>
          </div>

          <div className="home-analysis-grid">
            {marketAnalysis.map((item) => (
              <AnalysisCard
                key={item.id}
                item={item}
                analysis={analysisBySymbol.get(
                  item.dataSymbol ?? item.symbol
                )}
                status={analysisStatus}
                isArabic={isArabic}
                now={analysisNow}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ECONOMIC CALENDAR */}

      <section className="calendar-section">
        <div className="container">
          <div className="section-heading calendar-heading">
            <div>
              <span className="section-eyebrow">
                {t("home.globalEvents")}
              </span>
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
                <span className="filter-count">
                  {impactFilters.length}
                </span>
              )}

              <span
                className={`filter-chevron ${
                  isFilterOpen ? "open" : ""
                }`}
              >
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

                        <span
                          className={`filter-impact-dot ${impact}`}
                        />

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
                      <td className="calendar-time">
                        {new Date(event.event_time).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>

                      <td>
                        <div className="currency-cell">
                          <img
                            src={
                              event.country
                                ? `https://flagcdn.com/w40/${event.country.toLowerCase()}.png`
                                : ""
                            }
                            alt={`${event.currency} flag`}
                            className="currency-flag"
                          />
                          <strong>{event.currency}</strong>
                        </div>
                      </td>

                      <td>
                        <div className={`impact impact-${event.impact}`}>
                          <div className="impact-dots">
                            {Array.from({
                              length: impactDots[event.impact] || 1,
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

                      <td className="calendar-event">
                        {event.event_name}
                      </td>

                      <td className="calendar-actual">
                        {displayCalendarValue(event.actual)}
                      </td>

                      <td>
                        {displayCalendarValue(event.forecast)}
                      </td>

                      <td>
                        {displayCalendarValue(event.previous)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="calendar-empty">
                      {calendarLoading && calendarEvents.length === 0
                        ? t("calendar.loading")
                        : calendarError && calendarEvents.length === 0
                          ? t("calendar.loadError")
                          : calendarEvents.length === 0
                            ? t("calendar.noEventsToday")
                            : t("calendar.noEvents")}
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