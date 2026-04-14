import React, { useEffect, useRef, useContext } from 'react';
import './InfoSidebar.scss';
import Player from '../Player/Player';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';

// Render InfoSidebar component
export default function InfoSidebar({ mapPoint, isSidebarOpen, toggleSidebar, category }) {
  const { isEs } = useContext(LanguageContext);
  const sidebarRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (isSidebarOpen) {
      sidebarRef.current.show();
    } else {
      sidebarRef.current.close();
      if (playerRef?.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    }
  }, [isSidebarOpen]);

  // Handle Escape key to close the sidebar
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        toggleSidebar(false);
      }
    };
    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSidebarOpen, toggleSidebar]);

  const c = mapPoint?.channel;
  const s = mapPoint?.statistics;

  const tr = isEs ? translations.es : translations.en;

  return (
    <dialog ref={sidebarRef} className='sidebar sidebar--map-point'>
      <span className='sidebar__bg'></span>
      <div className="sidebar__content">
        <menu>
          <div className='close-icon'>
            <button type="reset" className='toggle-btn' onClick={() => toggleSidebar(false)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </menu>
        <h2 className="sidebar__title">{tr.statsFor} {mapPoint?.regionName} <span className='sidebar__flag'>{mapPoint?.flag}</span></h2>
        <div className="sidebar__list">
          <div className='channel-content channel-content__top'>
            <img src={c?.channelImage} alt="marker" />
            <div className='channel-content__text'>

              <div className='channel-content__text-group mt-0'>
                <h3 className='channel-content__heading'>{tr.channelName}</h3>
                <a target="_blank" href={`https://youtube.com/channel/${c?.channelId}`}>{c?.channelTitle}</a>
              </div>

              <div className='channel-content__text-group mt-0'>
                <h3 className='channel-content__heading'>{tr.channelUsername}</h3>
                <p>{c?.channelUsername}</p>
              </div>

              <div className='channel-content__text-group mt-0'>
                <h3 className='channel-content__heading'>{tr.category}</h3>
                <p>{category}</p>
              </div>

            </div>
          </div>
          <div className='channel-content channel-content__bottom'>
            <h2 className="channel-content__subheading">{tr.mostPopularVideo}</h2>
            <div className='channel-content__text'>

              <a target="_blank" href={`https://www.youtube.com/watch?v=${mapPoint?.idVideo}`}>{mapPoint?.videoTitle}</a>

              <div className='channel-content__stats'>
                <div className='channel-content__text-group'>
                  <h4 className='channel-content__heading'>👁️</h4>
                  <p>{Number(s?.viewCount).toLocaleString()}</p>
                </div>

                <div className='channel-content__text-group'>
                  <h4 className='channel-content__heading'>👍🏼</h4>
                  <p>{Number(s?.likeCount).toLocaleString()}</p>
                </div>

                <div className='channel-content__text-group'>
                  <h4 className='channel-content__heading'>💬</h4>
                  <p>{Number(s?.commentCount).toLocaleString()}</p>
                </div>
              </div>
            </div>
            {mapPoint?.idVideo && mapPoint.idVideo.trim() !== '' && <Player ref={playerRef} idVideo={mapPoint.idVideo} />}
          </div>
        </div>
      </div>
    </dialog >
  );
}