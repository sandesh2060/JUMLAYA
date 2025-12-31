// ============================================
// Frontend/src/context/LanguageContext.jsx - FIXED WITH t FUNCTION
// ============================================
import { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation(); // ✅ Added t here
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ne", name: "नेपाली", flag: "🇳🇵" },
  ];

  useEffect(() => {
    console.log("🌍 LanguageContext mounted, current language:", i18n.language);
    
    const handleLanguageChange = (lng) => {
      console.log("🌍 Language changed to:", lng);
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    setCurrentLanguage(i18n.language);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = (langCode) => {
    console.log("🌍 Changing language to:", langCode);
    i18n.changeLanguage(langCode);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    languages,
    t, // ✅ Added t function to context value
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext, LanguageProvider };