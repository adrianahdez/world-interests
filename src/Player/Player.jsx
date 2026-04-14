import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './Player.scss';

// Render Player component using a plain iframe instead of the YouTube IFrame API.
// This avoids loading www-widgetapi.js which produces an unfixable 'web-share' console warning.
// Playback control (pause on sidebar close) is handled via YouTube's postMessage API.
// Video switching uses postMessage cueVideoById instead of changing the iframe src,
// which avoids iframe navigation that destabilises Chrome's built-in Cast extension.
const Player = forwardRef(({ idVideo }, ref) => {
  const iframeRef = useRef(null);
  const isReadyRef = useRef(false);
  const initialVideoRef = useRef(idVideo);

  const postCommand = (func, args = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func,
        args
      }), '*');
    }
  };

  // When idVideo changes after initial load, switch videos via postMessage
  // instead of navigating the iframe (which breaks Chrome's Cast extension).
  useEffect(() => {
    if (idVideo && isReadyRef.current) {
      postCommand('cueVideoById', [idVideo]);
    }
  }, [idVideo]);

  const handleLoad = () => {
    isReadyRef.current = true;
  };

  useImperativeHandle(ref, () => ({
    pauseVideo() {
      postCommand('pauseVideo');
    }
  }));

  // The iframe src is set once via the first idVideo. Subsequent video changes
  // are handled via postMessage in the useEffect above, avoiding iframe navigation.
  return (
    <div className='player-container'>
      {initialVideoRef.current && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${initialVideoRef.current}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
          onLoad={handleLoad}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        />
      )}
    </div>
  );
});

export default Player;
