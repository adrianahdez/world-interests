import React from 'react';
import './Menu.scss';

export default function Menu({ isDialogOpen, toggleDialog }) {

  // Return a burger menu icon
  return (
    <div className={`menu-toggle${isDialogOpen === true ? ' open' : ''}`}>
      <div className='toggle-btn' onClick={toggleDialog}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}