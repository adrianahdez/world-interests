import React, { useEffect, useRef } from 'react';
import './InfoSidebar.scss';

// Render InfoSidebar component
export default function InfoSidebar({ mapPoint, isSidebarOpen, toggleSidebar }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isSidebarOpen) {
      sidebarRef.current.show();
    } else {
      sidebarRef.current.close();
    }
  }, [isSidebarOpen]);

  const c = mapPoint?.channel;
  const s = mapPoint?.statistics;
  const channelImg = c?.channelImage ? c.channelImage : 'https://via.placeholder.com/80x80?text=Image+Not+Found';

  return (
    <dialog ref={sidebarRef} className='sidebar sidebar--map-point'>
      <span className='sidebar__bg'></span>
      <div className="sidebar__content">
        <menu>
          <button className="cancel-button" type="reset" onClick={() => toggleSidebar(false)}>
            {/* <img style={{ width: "18px" }} src="/img/icons/close.svg" /> */}
            <span>X</span>
          </button>
        </menu>
        <h2 className="sidebar__title">Channel info</h2>
        <div className="sidebar__list">
          <div className='channel-content channel-content__top'>
          <img src={channelImg} alt="marker" />
          <div className='channel-content__text'>
            <span className='channel-content__heading'>Channel Name: </span>
            <span>{c?.channelTitle}</span>
            <span className='channel-content__heading'>Channel username:</span>
            <span>{c?.channelUsername}</span>
            <span className='channel-content__heading'>Region:</span>
            <span>{mapPoint?.regionName}</span>
          </div>
          </div>
          <div className='channel-content channel-content__bottom'>
          <h2 className="channel-content__subheading">Statistics</h2>
          <div className='channel-content__text'>
            <h3 className='channel-content__heading'>Today's Most Popular Video: </h3>
            <a target="_blank" href={`https://www.youtube.com/watch?v=${mapPoint?.idVideo}`}>[VIDEO_NAME]</a>
            <span className='channel-content__heading'>View Count: </span>
            <span>{s?.viewCount}</span>
            <span className='channel-content__heading'>Like Count:</span>
            <span>{s?.likeCount}</span>
            <span className='channel-content__heading'>Comment Count:</span>
            <span>{s?.commentCount}</span>
          </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}