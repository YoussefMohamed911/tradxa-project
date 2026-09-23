import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./Footer.css";

const CONTACTS = {
  email: "YOUR_EMAIL@gmail.com",

  instagram: "https://instagram.com/YOUR_USERNAME",

  whatsapp: "https://wa.me/201XXXXXXXXX",
};

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container footer-main">
        {/* BRAND */}

        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Tradxa
          </Link>

          <p>{t("footer.description")}</p>
        </div>

        {/* PLATFORM */}

        <div className="footer-links">
          <h4>{t("footer.platform")}</h4>

          <Link to="/">{t("nav.home")}</Link>

          <Link to="/news">{t("nav.news")}</Link>

          <Link to="/calendar">{t("nav.calendar")}</Link>

          <Link to="/markets">{t("nav.markets")}</Link>

          <Link to="/signals">{t("nav.signals")}</Link>
        </div>

        {/* CONTACT */}

        <div className="footer-contact">
          <div className="footer-contact-heading">
            <h4>{t("footer.contact")}</h4>

            <p>{t("footer.contactSubtitle")}</p>
          </div>

          <div className="footer-contact-buttons">
            {/* EMAIL */}

            <a href={`mailto:${CONTACTS.email}`} className="contact-btn">
              <span className="contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>

              <span className="contact-text">
                <small>{t("footer.email")}</small>

                <strong>{CONTACTS.email}</strong>
              </span>

              <span className="contact-arrow">↗</span>
            </a>

            {/* INSTAGRAM */}

            <a
              href={CONTACTS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn"
            >
              <span className="contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="4" width="16" height="16" rx="5" />

                  <circle cx="12" cy="12" r="3.5" />

                  <circle cx="17.3" cy="6.8" r="0.8" fill="currentColor" />
                </svg>
              </span>

              <span className="contact-text">
                <small>Instagram</small>

                <strong>{t("footer.followUs")}</strong>
              </span>

              <span className="contact-arrow">↗</span>
            </a>

            {/* WHATSAPP */}

            <a
              href={CONTACTS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn contact-whatsapp"
            >
              <span className="contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 11.5a8 8 0 0 1-11.7 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
                  <path d="M9 8.5c.5 2.4 2.1 4 4.5 5" />
                </svg>
              </span>

              <span className="contact-text">
                <small>WhatsApp</small>

                <strong>{t("footer.chatWithUs")}</strong>
              </span>

              <span className="contact-arrow">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM */}

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} Tradxa</span>

          <span>{t("footer.rights")}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
