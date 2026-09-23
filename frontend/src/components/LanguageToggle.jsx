import { useTranslation } from "react-i18next";

function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "en" ? "ar" : "en";

    i18n.changeLanguage(newLanguage);

    localStorage.setItem("tradxa-language", newLanguage);

    document.documentElement.lang = newLanguage;

    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
  };

  return (
    <button
      className="header-control-btn"
      onClick={toggleLanguage}
      aria-label="Change language"
    >
      {i18n.language === "en" ? "AR" : "EN"}
    </button>
  );
}

export default LanguageToggle;
