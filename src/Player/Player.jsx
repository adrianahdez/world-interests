import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './Player.scss';

// Render Player component
const Player = forwardRef(({ idVideo }, ref) => {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  // Change the iframe when the video id changes.
  // Load the YouTube iframe API. We need all of this in order to be able to pause the player when the sidebar is closed.
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
      if (playerInstance.current) {
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