import React, { useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import './ChannelPanel.scss';
import Player from '../Player/Player';
import { LanguageContext } from '../Common/LanguageContext';
import { MapPointContext } from '../Common/MapPointContext';
import { SidebarContext } from '../Common/SidebarContext';
import translations from '../Common/translations';
import { IconEye, IconThumbUp, IconComment } from '../Common/Icons';

// Render ChannelPanel component
export default function ChannelPanel({ categoryName }) {
  const { isEs } = useContext(LanguageContext);
  const { mapPoint } = useContext(MapPointContext);
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const sidebarRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const dialog = sidebarRef.current;
    if (isSidebarOpen) {
      dialog.classList.remove('sidebar--closing');
      dialog.show();
    } else if (dialog.open) {
      // Play close animation before hiding — pause video immediately so audio stops.
      if (playerRef?.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
      dialog.classList.add('sidebar--closing');
      const onAnimationEnd = () => {
        dialog.classList.remove('sidebar--closing');
        dialog.close();
      };
      dialog.addEventListener('animationend', onAnimationEnd, { once: true });
      return () => dialog.removeEventListener('animationend', onAnimationEnd);
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
    <dialog ref={sidebarRef} className='sidebar sidebar--map-point' aria-labelledby="infosidebar-title">
      <span className='sidebar__bg'></span>
      <div className="sidebar__content">
        <menu>
          <div className='close-icon'>
            <button type="button" className='toggle-btn' onClick={() => toggleSidebar(false)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </menu>
        <h2 id="infosidebar-title" className="sidebar__title">{tr.channelPanelTitle} {mapPoint?.flag} {typeof mapPoint?.regionName === 'object' ? (mapPoint.regionName[isEs ? 'es' : 'en'] ?? mapPoint.regionName.en) : mapPoint?.regionName}</h2>
        <div className="sidebar__list">
          <div className='channel-content channel-content__top'>
            <img src={c?.channelImage} alt={`${c?.channelTitle ?? 'Channel'} logo`} loading="lazy" referrerPolicy="no-referrer" />
            <div className='channel-content__text'>

              <div className='channel-content__text-group mt-0'>
                <h3 className='channel-content__heading'>{tr.channelName}</h3>
                <a target="_blank" rel="noopener noreferrer" href={`https://youtube.com/channel/${c?.channelId}`}>{c?.channelTitle}</a>
              </div>

              <div className='channel-content__text-group mt-0'>
                <h3 className='channel-content__heading'>{tr.channelUsername}</h3>
                <p>{c?.channelUsername}</p>
              </div>

              <div className='channel-content__text-group mt-0'>
                <h3 className='channel-content__heading'>{tr.category}</h3>
                <p>{categoryName}</p>
              </div>

            </div>
          </div>
          <div className='channel-content channel-content__bottom'>
            <div className='channel-content__text'>
              <div className='channel-content__text-group mt-0'>
                <h4 className="channel-content__heading channel-content__video-label">{tr.videoLabel}</h4>
                <a target="_blank" rel="noopener noreferrer" href={`https://www.youtube.com/watch?v=${mapPoint?.idVideo}`}>{mapPoint?.videoTitle}</a>
              </div>

              <div className='channel-content__stats'>
                <span><IconEye className="stat-icon" /> {Number(s?.viewCount).toLocaleString()}</span>
                <span><IconThumbUp className="stat-icon" /> {Number(s?.likeCount).toLocaleString()}</span>
                <span><IconComment className="stat-icon" /> {Number(s?.commentCount).toLocaleString()}</span>
              </div>
            </div>
            {mapPoint?.idVideo && mapPoint.idVideo.trim() !== '' && <Player ref={playerRef} idVideo={mapPoint.idVideo} />}
          </div>
        </div>
      </div>
    </dialog >
  );
}

ChannelPanel.propTypes = {
  categoryName: PropTypes.string,
};