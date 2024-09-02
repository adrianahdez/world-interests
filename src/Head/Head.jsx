import React, { useEffect, useContext } from 'react';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';

const metaTag = {
  ogTitle: 'og:title',
  ogDescription: 'og:description',
  ogImage: 'og:image',
  ogUrl: 'og:url',
  ogType: 'og:type',
  twitterCard: 'twitter:card',
  twitterTitle: 'twitter:title',
  twitterDescription: 'twitter:description',
  twitterImage: 'twitter:image',
};

const addGoogleAnalyticsScript = () => {
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

  return script;
};

// Remove meta tags
const removeMetaTags = () => {
  const metaTags = Object.values(metaTag);

  metaTags.forEach(property => {
    const meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
    if (meta) document.head.removeChild(meta);
  });
};

// Render Header component
export default function Head() {
  const { isEs } = useContext(LanguageContext);
  const tr = isEs ? translations.es : translations.en;

  // Add meta tags
  const addMetaTags = () => {
    const keywords = "YouTube, live, music, videos, channels, countries, map, realtime, popular, trending, top, statistics, data, information, info, categories, free";
    const metaTags = [
      { property: metaTag.ogTitle, content: tr.appMetaTagTitle },
      { property: metaTag.ogDescription, content: tr.appMetaTagDescription },
      { property: metaTag.ogImage, content: process.env.REACT_APP_BACKEND_API_URL + 'screenshot.jpg' },
      { property: metaTag.ogUrl, content: window.location.href },
      { property: metaTag.ogType, content: 'website' },
      { name: metaTag.twitterCard, content: 'summary_large_image' },
      { name: metaTag.twitterTitle, content: tr.appMetaTagTitle },
      { name: metaTag.twitterDescription, content: tr.appMetaTagDescription },
      { name: metaTag.twitterImage, content: process.env.REACT_APP_BACKEND_API_URL + 'screenshot.jpg' },

      // Add more meta tags here. description, keywords, robots, etc.
      { name: 'description', content: tr.appMetaTagDescription },
      { name: 'keywords', content: keywords },
      { name: 'robots', content: 'index, follow' },
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      Object.keys(tag).forEach(attr => meta.setAttribute(attr, tag[attr]));
      document.head.appendChild(meta);
    });
  };

  useEffect(() => {
    // Add Google Analytics script and meta tags.
    const script = addGoogleAnalyticsScript();
    addMetaTags();

    return () => {
      // Clean up: remove the script and meta tags if the component is unmounted
      if (script && script.parentNode) {
        document.head.removeChild(script);
      }
      removeMetaTags();
    };
  }, []);

  return null;
}