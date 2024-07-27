import React, { useEffect, useRef } from 'react';
import './InfoSidebar.scss';

// Render InfoSidebar component
export default function InfoSidebar({ mapPoint, setPoint, isSidebarOpen, toggleSidebar }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isSidebarOpen) {
      sidebarRef.current.show();
    } else {
      sidebarRef.current.close();
    }
  }, [isSidebarOpen]);

  return (
    <dialog ref={sidebarRef} className='sidebar sidebar--map-point'  style={{
      // TODO: Temporal
      left: 'unset',
      right: '24px',
      // display: 'flex',
      opacity: 1,
      zIndex: 501,
    }}>
      <span className='sidebar__bg'></span>
      <div className="sidebar__content">
        <menu>
          <button className="cancelButton" type="reset" onClick={toggleSidebar}>
            {/* <img style={{ width: "18px" }} src="/img/icons/close.svg" /> */}
            <span>X</span>
          </button>
        </menu>
        <h2 className="sidebar__title">Categories</h2>
        <ul className="sidebar__list">
          {/* Point info here */}
          Lorem ipsum dolor sit amet
        </ul>
      </div>
    </dialog>
  );
}