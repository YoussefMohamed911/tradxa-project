import { useTranslation } from "react-i18next";
import './NewsTicker.css'
const latestNews = [
  {
    id: 1,
    category: "gold",
    tone: "gold",
    titleKey: "ticker.news.gold",
  },
  {
    id: 2,
    category: "silver",
    tone: "silver",
    titleKey: "ticker.news.silver",
  },
  {
    id: 3,
    category: "oil",
    tone: "oil",
    titleKey: "ticker.news.oil",
  },
  {
    id: 4,
    category: "forex",
    tone: "fx",
    titleKey: "ticker.news.forex",
  },
  {
    id: 5,
    category: "crypto",
    tone: "crypto",
    titleKey: "ticker.news.crypto",
  },
];

function NewsTicker() {
  const { t } = useTranslation();

  const tickerItems = [...latestNews, ...latestNews];

  return (
    <section className="latest-ticker">
      <div className="latest-ticker-label">
        <span className="latest-ticker-icon">⚡</span>

        <span>{t("ticker.latestNews")}</span>
      </div>

      <div className="latest-ticker-window">
        <div className="latest-ticker-track">
          {tickerItems.map((item, index) => (
            <div className="latest-ticker-item" key={`${item.id}-${index}`}>
              <span className={`latest-ticker-dot ${item.tone}`} />

              <span className={`latest-ticker-category ${item.tone}`}>
                {t(`categories.${item.category}`)}
              </span>

              <span className="latest-ticker-title">{t(item.titleKey)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewsTicker;
