import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [isEs, setIsEs] = useState(() => {
    // Get the language from the localStorage
    const isEsSavedLang = localStorage.getItem('isEs');
    return isEsSavedLang === 'true'; // Return true if the isEs saved language is 'true' or false otherwise
  });

  useEffect(() => {
    // Store the language in the localStorage when it changes. If it's not defined, it will be set to 'false' by default.
    localStorage.setItem('isEs', isEs);
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
