import React from 'react';
import './Menu.scss';

export default function Menu({ toggleDialog }) {

  // Return a burger menu icon
  return (
    <div className='menu-toggle'>
      <div className='toggle-btn' onClick={toggleDialog}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}