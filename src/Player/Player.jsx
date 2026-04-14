import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './Player.scss';

// Suppress YouTube's unfixable 'web-share' Permissions-Policy warning.
// YouTube's www-widgetapi.js checks for a feature that Chrome 120+ removed
// from its Permissions-Policy registry. This cannot be fixed at the app level.
const _warn = console.warn.bind(console);
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('web-share')) return;
  _warn(...args);
};

// Render Player component
const Player = forwardRef(({ idVideo }, ref) => {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  // IMPORTANT: We must use the YouTube IFrame API (YT.Player) instead of a plain <iframe>.
  // A plain iframe causes Chrome to crash when switching between videos because the iframe
  // navigates to a new URL, which disrupts Chrome's built-in Cast extension and GPU video
  // decoding resources. YT.Player handles video transitions internally via loadVideoById()
  // without iframe navigation, keeping Chrome stable. Do not replace this with a plain iframe.
  useEffect(() => {
    if (idVideo) {
      if (playerInstance.current) {
        playerInstance.current.loadVideoById(idVideo);
      } else {
        const onYouTubeIframeAPIReady = () => {
          playerInstance.current = new window.YT.Player(playerRef.current, {
            videoId: idVideo,
            events: {
              onReady: () => {
                playerInstance.current.cueVideoById(idVideo);
              }
            }
          });
        };

        if (!window.YT) {
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          tag.async = true;
          window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
          document.head.appendChild(tag);
        } else {
          onYouTubeIframeAPIReady();
        }
      }
    }

    return () => {
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [idVideo]);

  useImperativeHandle(ref, () => ({
    pauseVideo() {
      if (playerInstance?.current && typeof playerInstance.current.pauseVideo === 'function') {
        playerInstance.current.pauseVideo();
      }
    }
  }));

  return (
    <div className='player-container'>
      <div id="player" ref={playerRef} />
    </div>
  );
});

export default Player;
