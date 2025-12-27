// Frontend/src/hooks/useLanguage.js
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage must be used within a LanguageProvider. ' +
      'Make sure your component is wrapped with <LanguageProvider>.'
    );
  }

  return context;
};
