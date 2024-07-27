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
            <img src={c?.channelImage} alt="marker" />
            <div className='channel-content__text'>
              <h3 className='channel-content__heading'>Channel Name: </h3>
              <a target="_blank" href={`https://youtube.com/channel/${c?.channelId}`}>{c?.channelTitle}</a>
              <h3 className='channel-content__heading'>Channel username:</h3>
              <p>{c?.channelUsername}</p>
              <h3 className='channel-content__heading'>Country/Region:</h3>
              <p>{mapPoint?.regionName}</p>
            </div>
          </div>
          <div className='channel-content channel-content__bottom'>
            <h2 className="channel-content__subheading">Statistics</h2>
            <div className='channel-content__text'>
              <h3 className='channel-content__heading'>Today's Most Popular Video: </h3>
              <a target="_blank" href={`https://www.youtube.com/watch?v=${mapPoint?.idVideo}`}>{mapPoint?.videoTitle}</a>
              <h4 className='channel-content__heading'>View Count: </h4>
              <p>{s?.viewCount}</p>
              <h4 className='channel-content__heading'>Like Count:</h4>
              <p>{s?.likeCount}</p>
              <h4 className='channel-content__heading'>Comment Count:</h4>
              <p>{s?.commentCount}</p>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}