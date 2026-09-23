import { useEffect, useMemo, useState } from "react";
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

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [impact, setImpact] = useState("all");
  const [currency, setCurrency] = useState("all");

  const { monday, sunday } = useMemo(
    () => getWeekRange(selectedDate),
    [selectedDate]
  );

  useEffect(() => {
  loadEvents();

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
        loadEvents();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [monday.getTime(), sunday.getTime()]);


  async function loadEvents() {
    setLoading(true);

    const { data, error } = await supabase
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
      .gte("event_time", monday.toISOString())
      .lte("event_time", sunday.toISOString())
      .order("event_time", { ascending: true });

    if (error) {
      console.error("Calendar error:", error);
      setEvents([]);
    } else {
      setEvents(data || []);
    }

    setLoading(false);
  }

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
  }, 
  
  [events, impact, currency]);

  const groupedEvents = useMemo(() => {
  const groups = {};

  filteredEvents.forEach((event) => {
    const date = new Date(event.event_time);

    const key = date.toLocaleDateString("en-CA");

    if (!groups[key]) {
      groups[key] = {
        date,
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
              <span className="calendar-live-dot" />

              <div>
                <strong>Live Economic Data</strong>
                <span>Powered by Tradxa</span>
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
                  value={selectedDate
                    .toISOString()
                    .slice(0, 10)}
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
  {loading ? (
    <div className="calendar-empty-state">
      Loading economic events...
    </div>
  ) : groupedEvents.length === 0 ? (
    <div className="calendar-empty-state">
      No economic events found.
    </div>
  ) : (
    groupedEvents.map((group, groupIndex) => {
      const isToday =
        group.date.toDateString() ===
        new Date().toDateString();

      return (
        <section
          key={group.date.toISOString()}
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