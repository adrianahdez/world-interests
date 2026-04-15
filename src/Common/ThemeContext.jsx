import React, { createContext, useState, useEffect } from 'react';
import { STORAGE_KEY_THEME } from '../config';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get the theme from the localStorage
    const isDarkSavedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    // Return true if it's not defined or if it's set, return the saved theme
    return isDarkSavedTheme === null ? true : isDarkSavedTheme === 'true';
  });

  useEffect(() => {
    // Store the theme in the localStorage when it changes. If it's not defined, it will be set to 'true' by default.
    try {
      localStorage.setItem(STORAGE_KEY_THEME, isDarkMode);
    } catch (e) {
      console.warn('[WorldInterests] Could not save theme preference:', e.message);
    }
    // Change the class of the document element to 'dark' or 'light' depending on the theme
    document.documentElement.className = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevTheme) => !prevTheme);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
