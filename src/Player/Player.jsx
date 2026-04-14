import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import './Player.scss';

// Render Player component using a plain iframe instead of the YouTube IFrame API.
// This avoids loading www-widgetapi.js which produces an unfixable 'web-share' console warning.
// Playback control (pause on sidebar close) is handled via YouTube's postMessage API.
const Player = forwardRef(({ idVideo }, ref) => {
  const iframeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    pauseVideo() {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'pauseVideo',
          args: []
        }), '*');
      }
    }
  }));

  return (
    <div className='player-container'>
      {idVideo && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${idVideo}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      )}
    </div>
  );
});

export default Player;
