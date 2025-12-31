// Frontend/src/context/LanguageContext.jsx
import { createContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  
  // ✅ FIX: Use i18n.language (which reads from i18nextLng in localStorage)
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ne", name: "नेपाली", flag: "🇳🇵" },
  ];

  // ✅ FIX: Sync state when i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    setCurrentLanguage(i18n.language);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // ✅ FIX: Simplified changeLanguage function
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    languages,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext, LanguageProvider };