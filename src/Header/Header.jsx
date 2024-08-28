import React, { useContext } from 'react';
import './Header.scss';
import { LanguageContext } from '../Common/LanguageContext';

// Return a header with the burger menu icon and the language toggle button.
export default function Header({ isDialogOpen, toggleDialog }) {
  const { isEs, toggleLanguage } = useContext(LanguageContext);
  
  return (
    <header className='header'>
      <div className={`menu-item menu-toggle${isDialogOpen === true ? ' close-icon' : ''}`}>
        <div className='toggle-btn' onClick={toggleDialog}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className={`menu-item menu-item__lang${isEs === true ? ' es' : ' en'}`}>
        <div className='toggle-btn' onClick={toggleLanguage}>
          <span>{isEs === true ? 'ES' : 'EN'}</span>
        </div>
      </div>
    </header>
  );
}