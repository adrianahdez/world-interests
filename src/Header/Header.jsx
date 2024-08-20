import React, { useState } from 'react';
import './Header.scss';

export default function Header({ isDialogOpen, toggleDialog }) {

  const [isEs, setIsEs] = useState(() => setDefaultLang());

  // If the lang is not set, return false to show EN by default. If the lang is set, return the lang.
  function setDefaultLang() {
    const defaultLang = localStorage.getItem('isEs');
    return defaultLang === null ? false : defaultLang === 'true';
  }

  const toggleLang = () => {
    // Set the language to the opposite of the current state
    setIsEs((prev) => !prev);

    // Save the state in the local storage to remember the user's choice.
    localStorage.setItem('isEs', !isEs);
  }

  // Return a burger menu icon
  return (
    <header className='header'>
      <div className={`menu-toggle${isDialogOpen === true ? ' close-icon' : ''}`}>
        <div className='toggle-btn' onClick={toggleDialog}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}