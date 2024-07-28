import React, { useEffect, useState } from 'react';
import './Player.scss';

// Render Player component
export default function Player({ idVideo }) {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (idVideo) {
      console.log('idVideo:', idVideo);
      setVideoUrl(`https://www.youtube.com/embed/${idVideo}`);
    }
  }, [idVideo]);

  return (
    <div className='player-container'>
      {videoUrl ? (
        <iframe
          width="100%"
          height="315"
          src={videoUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      ) : (
        null
      )}
    </div>
  );
}