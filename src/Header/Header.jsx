import React, { useContext } from 'react';
import './Header.scss';
import MoonIcon from './MoonIcon';
import SunIcon from './SunIcon';
import { LanguageContext } from '../Common/LanguageContext';
import { ThemeContext } from '../Common/ThemeContext';

// Return a header with the burger menu icon and the language toggle button.
export default function Header({ isDialogOpen, toggleDialog }) {
  const { isEs, toggleLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <header className='header'>
      <div className={`menu-item ${isDialogOpen === true ? ' close-icon' : ''}`}>
        <div className='toggle-btn' onClick={toggleDialog}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className={`menu-item menu-item__lang${isEs === true ? ' es' : ' en'}`}>
        <div onClick={toggleLanguage}>
          <span>{isEs === true ? 'ES' : 'EN'}</span>
        </div>
      </div>
      <div className='menu-item menu-item__theme'>
        <span onClick={toggleTheme}>
        {isDarkMode ? <MoonIcon /> : <SunIcon />} 
        </span>
      </div>
    </header>
  );
}