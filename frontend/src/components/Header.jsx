import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import logoDark from "../assets/tradxa-logo-dark.png";
import logoLight from "../assets/tradxa-logo-light.png";

import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import InstallAppButton from "./InstallAppButton";

import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

import "./Header.css";

function Header() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const logo = theme === "dark" ? logoDark : logoLight;

  const navClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <img
            src={logo}
            alt="Tradxa - Trade Expert AI"
            className="brand-logo"
          />
        </Link>

        <nav className="nav">
          <NavLink to="/" end className={navClass}>
            {t("nav.home")}
          </NavLink>

          <NavLink to="/news" className={navClass}>
            {t("nav.news")}
          </NavLink>

          <NavLink to="/calendar" className={navClass}>
            {t("nav.calendar")}
          </NavLink>

          <NavLink to="/markets" className={navClass}>
            {t("nav.markets")}
          </NavLink>

          <NavLink to="/signals" className={navClass}>
            {t("nav.signals")}
          </NavLink>

          <NavLink to="/books" className={navClass}>
            {t("nav.books")}
          </NavLink>
        </nav>

        <div className="header-actions">
          <LanguageToggle />

          <ThemeToggle />

          <InstallAppButton />

          {!user ? (
            <>
              <Link to="/login" className="login-btn">
                {t("nav.login")}
              </Link>

              <Link to="/register" className="register-btn">
                {t("nav.register")}
              </Link>
            </>
          ) : (
            <div className="user-area">
              <Link to="/account" className="user-name">
                👤 {userName}
              </Link>

              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
