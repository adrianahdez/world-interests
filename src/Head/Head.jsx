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
  if (process.env.NODE_ENV !== 'production') {
    // GA is always disabled in development — dev traffic must never be tracked.
    if (process.env.REACT_APP_GA_ID) {
      // Someone added the GA ID to .env — this is a misconfiguration.
      console.warn('[WorldInterests] ⚠️ REACT_APP_GA_ID IS SET IN THE DEV ENVIRONMENT — THIS SHOULD NEVER HAPPEN. The GA ID must only live in .env.production. Remove it from .env immediately. Dev traffic must never be tracked. GA tracking is disabled for this session.');
    } else {
      // Normal dev case: ID absent from .env, as expected.
      console.warn('[WorldInterests] GA tracking is intentionally disabled in development — this is expected. To ensure production tracking works, verify that REACT_APP_GA_ID is present in .env.production. Do NOT add it to .env (the dev env file).');
    }
    return null;
  }

  // In production, fall back to the bundled ID if the env var is absent.
  if (!process.env.REACT_APP_GA_ID) {
    console.warn('[WorldInterests] REACT_APP_GA_ID is not set in this production build — falling back to the hardcoded ID. Add REACT_APP_GA_ID to .env.production (or the CI/CD environment variables) to use the configured tracking ID.');
  }
  const gaId = process.env.REACT_APP_GA_ID || 'G-MDKV0QPB8F';

  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script.async = true;
  document.head.appendChild(script);

  // Configure Google Analytics
  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', gaId);
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
    const currentURL = window.location.href;
    const currentURLWithoutParams = currentURL.split('?')[0];

    const metaTags = [
      { property: metaTag.ogTitle, content: tr.appMetaTagTitle },
      { property: metaTag.ogDescription, content: tr.appMetaTagDescription },
      { property: metaTag.ogImage, content: currentURLWithoutParams + 'screenshot.jpg' },
      { property: metaTag.ogUrl, content: currentURL },
      { property: metaTag.ogType, content: 'website' },
      { name: metaTag.twitterCard, content: 'summary_large_image' },
      { name: metaTag.twitterTitle, content: tr.appMetaTagTitle },
      { name: metaTag.twitterDescription, content: tr.appMetaTagDescription },
      { name: metaTag.twitterImage, content: currentURLWithoutParams + 'screenshot.jpg' },

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
      // Clean up: remove the script (if GA was initialised) and meta tags on unmount.
      if (script && script.parentNode) {
        document.head.removeChild(script);
      }
      removeMetaTags();
    };
  }, []);

  return null;
}