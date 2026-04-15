import React, { createContext, useState, useEffect } from 'react';
import { STORAGE_KEY_LANG } from '../config';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [isEs, setIsEs] = useState(() => {
    // Get the language from the localStorage
    const isEsSavedLang = localStorage.getItem(STORAGE_KEY_LANG);
    // Return true if the isEs saved language is 'true' or false otherwise
    return isEsSavedLang === 'true';
  });

  useEffect(() => {
    // Store the language in the localStorage when it changes. If it's not defined, it will be set to 'false' by default.
    try {
      localStorage.setItem(STORAGE_KEY_LANG, isEs);
    } catch (e) {
      console.warn('[WorldInterests] Could not save language preference:', e.message);
    }
  }, [isEs]);

  const toggleLanguage = () => {
    setIsEs((prevLang) => !prevLang);
  };

  return (
    <LanguageContext.Provider value={{ isEs, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
