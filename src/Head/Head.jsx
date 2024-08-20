import React, { useEffect } from 'react';

// Render Header component
export default function Head() {

  useEffect(() => {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-MDKV0QPB8F";
    script.async = true;
    document.head.appendChild(script);

    // Configure Google Analytics
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-MDKV0QPB8F');
    };

    return () => {
      // Clean up: remove the script if the component is unmounted
      document.head.removeChild(script);
    };
  }, []);

  return null;
}


