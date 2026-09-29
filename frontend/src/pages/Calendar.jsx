import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Calendar.css";

const impacts = ["all", "high", "medium", "low"];

function getWeekRange(date) {
  const current = new Date(date);
  const day = current.getDay();

  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLocalDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [realtimeLive, setRealtimeLive] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [impact, setImpact] = useState("all");
  const [currency, setCurrency] = useState("all");

  const requestIdRef = useRef(0);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const { monday, sunday } = useMemo(
    () => getWeekRange(selectedDate),
    [selectedDate]
  );

  const weekStartMs = monday.getTime();
  const weekEndMs = sunday.getTime();

  useEffect(() => {
    let cancelled = false;

    async function loadEvents(showLoading) {
      const requestId = ++requestIdRef.current;

      if (showLoading) {
        setLoading(true);
        setError(false);
      }

      const weekStart = new Date(weekStartMs);
      const weekEnd = new Date(weekEndMs);

      const { data, error: queryError } = await supabase
        .from("economic_events")
        .select(
          `
        id,
        external_id,
        event_time,
        country,
        currency,
        event_name,
        impact,
        actual,
        forecast,
        previous
        `
        )
        .gte("event_time", weekStart.toISOString())
        .lte("event_time", weekEnd.toISOString())
        .order("event_time", { ascending: true });

      if (cancelled || requestId !== requestIdRef.current) {
        return;
      }

      if (queryError) {
        console.error("Calendar error:", queryError);

        if (showLoading || eventsRef.current.length === 0) {
          setEvents([]);
          setError(true);
        }

        setLoading(false);
        return;
      }

      setError(false);
      setEvents(data || []);
      setLoading(false);
    }

    loadEvents(true);

    const channel = supabase
      .channel("tradxa-economic-calendar")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "economic_events",
        },
        () => {
          loadEvents(false);
        }
      )
      .subscribe((status, err) => {
        if (cancelled) {
          return;
        }

        if (status === "SUBSCRIBED") {
          setRealtimeLive(true);
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          if (err) {
            console.warn("Calendar realtime status:", status, err);
          }
          setRealtimeLive(false);
        } else {
          setRealtimeLive(false);
        }
      });

    const fallback = setInterval(() => {
      loadEvents(false);
    }, 60000);

    return () => {
      cancelled = true;
      requestIdRef.current += 1;
      clearInterval(fallback);
      supabase.removeChannel(channel);
      setRealtimeLive(false);
    };
  }, [weekStartMs, weekEndMs]);

  const currencies = useMemo(() => {
    return [
      ...new Set(
        events
          .map((event) => event.currency)
          .filter(Boolean)
      ),
    ].sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const impactMatch =
        impact === "all" || event.impact === impact;

      const currencyMatch =
        currency === "all" || event.currency === currency;

      return impactMatch && currencyMatch;
    });
  }, [events, impact, currency]);

  const groupedEvents = useMemo(() => {
    const groups = {};

    filteredEvents.forEach((event) => {
      const date = new Date(event.event_time);

      const key = formatLocalDateInput(date);

      if (!groups[key]) {
        const dayDate = new Date(date);
        dayDate.setHours(0, 0, 0, 0);

        groups[key] = {
          key,
          date: dayDate,
          events: [],
        };
      }

      groups[key].events.push(event);
    });

    return Object.values(groups);
  }, [filteredEvents]);

  const changeWeek = (amount) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + amount * 7);
    setSelectedDate(next);
  };

  const goToday = () => {
    setSelectedDate(new Date());
  };

  const showInitialLoading = loading;
  const showError = error && events.length === 0 && !loading;
  const showEmptyWeek =
    !loading && !error && events.length === 0;
  const showEmptyFilters =
    !loading && events.length > 0 && groupedEvents.length === 0;

  return (
    <main className="calendar-page">
      <section className="calendar-hero">
        <div className="container">
          <div className="calendar-heading">
            <div>
              <span className="calendar-eyebrow">
                ECONOMIC EVENTS
              </span>

              <h1>Economic Calendar</h1>

              <p>
                Track major economic releases and events that
                can influence global financial markets.
              </p>
            </div>

            <div className="calendar-status">
              <span
                className={`calendar-live-dot${
                  realtimeLive ? "" : " is-offline"
                }`}
              />

              <div>
                <strong>
                  {realtimeLive
                    ? "Live Economic Data"
                    : "Economic Data"}
                </strong>
                <span>
                  {realtimeLive
                    ? "Powered by Tradxa"
                    : "Realtime disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="calendar-content">
        <div className="container">
          <div className="calendar-date-nav">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
            >
              ‹
            </button>

            <div>
              <span>ECONOMIC EVENTS</span>

              <strong>
                {formatDate(monday)} — {formatDate(sunday)}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => changeWeek(1)}
            >
              ›
            </button>
          </div>

          <div className="calendar-toolbar">
            <div className="calendar-impact-filter">
              <span className="calendar-filter-label">
                IMPACT
              </span>

              <div className="calendar-filter-buttons">
                {impacts.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      impact === item ? "active" : ""
                    }
                    onClick={() => setImpact(item)}
                  >
                    {item === "all"
                      ? "All"
                      : item.charAt(0).toUpperCase() +
                        item.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="calendar-right-filters">
              <button
                type="button"
                className="calendar-today-btn"
                onClick={goToday}
              >
                Today
              </button>

              <div className="calendar-currency-filter">
                <span className="calendar-filter-label">
                  CURRENCY
                </span>

                <select
                  value={currency}
                  onChange={(e) =>
                    setCurrency(e.target.value)
                  }
                >
                  <option value="all">
                    All currencies
                  </option>

                  {currencies.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="calendar-picker">
                <span className="calendar-filter-label">
                  DATE
                </span>

                <input
                  type="date"
                  value={formatLocalDateInput(selectedDate)}
                  onChange={(e) => {
                    if (!e.target.value) return;

                    setSelectedDate(
                      new Date(
                        `${e.target.value}T12:00:00`
                      )
                    );
                  }}
                />
              </div>
            </div>
          </div>

          <div className="calendar-days-list">
            {showInitialLoading ? (
              <div className="calendar-empty-state">
                Loading economic events...
              </div>
            ) : showError ? (
              <div className="calendar-empty-state">
                Unable to load economic events.
              </div>
            ) : showEmptyWeek ? (
              <div className="calendar-empty-state">
                No economic events found.
              </div>
            ) : showEmptyFilters ? (
              <div className="calendar-empty-state">
                No events match the selected filters.
              </div>
            ) : (
              groupedEvents.map((group, groupIndex) => {
                const isToday =
                  group.key === formatLocalDateInput(new Date());

                return (
                  <section
                    key={group.key}
                    className={`calendar-day-group ${
                      groupIndex % 2 === 1
                        ? "calendar-day-alt"
                        : ""
                    }`}
                  >
                    <div className="calendar-day-heading">
                      <div className="calendar-day-heading-main">
                        <span className="calendar-weekday">
                          {group.date
                            .toLocaleDateString("en-US", {
                              weekday: "short",
                            })
                            .toUpperCase()}
                        </span>

                        <div className="calendar-day-date">
                          <strong>
                            {group.date.toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </strong>

                          <span>
                            {group.date.getFullYear()}
                          </span>
                        </div>

                        {isToday && (
                          <span className="calendar-today-tag">
                            TODAY
                          </span>
                        )}

                        <div className="calendar-day-line" />
                      </div>

                      <span className="calendar-event-count">
                        {group.events.length}{" "}
                        {group.events.length === 1
                          ? "event"
                          : "events"}
                      </span>
                    </div>

                    <div className="calendar-table-scroll">
                      <table className="calendar-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Currency</th>
                            <th>Event</th>
                            <th>Impact</th>
                            <th>Actual</th>
                            <th>Forecast</th>
                            <th>Previous</th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.events.map((event) => (
                            <tr key={event.id}>
                              <td className="calendar-time">
                                {formatTime(event.event_time)}
                              </td>

                              <td>
                                <div className="calendar-currency">
                                  <span className="calendar-country">
                                    {event.country}
                                  </span>

                                  <strong>
                                    {event.currency}
                                  </strong>
                                </div>
                              </td>

                              <td className="calendar-event-name">
                                {event.event_name}
                              </td>

                              <td>
                                <span
                                  className={`calendar-impact ${event.impact}`}
                                >
                                  {event.impact?.toUpperCase()}
                                </span>
                              </td>

                              <td className="calendar-number actual">
                                {event.actual ?? "—"}
                              </td>

                              <td className="calendar-number">
                                {event.forecast ?? "—"}
                              </td>

                              <td className="calendar-number">
                                {event.previous ?? "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })
            )}
          </div>

          <p className="calendar-disclaimer">
            Economic calendar data is automatically synchronized
            through the Tradxa backend.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Calendar;
