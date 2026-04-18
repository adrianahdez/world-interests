import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';

const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://worldinterests.midri.net';
const KEYWORDS = 'YouTube, live, music, videos, channels, countries, map, realtime, popular, trending, top, statistics, data, information, info, categories, free';

const JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'World Interests',
      url: SITE_URL + '/',
      description: 'An interactive map showing the #1 trending YouTube channel in every country, organized by category.',
      applicationCategory: 'DataVisualization',
      operatingSystem: 'Web',
      inLanguage: ['en', 'es'],
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Dataset',
      name: 'Trending YouTube Channels by Country',
      description: 'Real-time data on the #1 trending YouTube channel per country, updated daily, organized by category.',
      url: SITE_URL + '/',
      creator: { '@type': 'Person', name: 'Adriana Hernández Regueiro' },
      temporalCoverage: '2024/..',
    },
  ],
});

// Returns the canonical URL for the current page, keeping only the ?category= param.
const getCanonicalUrl = () => {
  const params = new URLSearchParams(window.location.search);
  params.delete('country');
  params.delete('channel');
  const search = params.toString();
  return window.location.origin + window.location.pathname + (search ? '?' + search : '');
};

// Updates an existing head tag in place, or creates and appends it if absent.
const upsertTag = (tagName, selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tagName);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
};

// Selectors for every tag this component manages — used for cleanup.
const MANAGED_SELECTORS = [
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:image"]',
  'meta[property="og:url"]',
  'meta[property="og:type"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
  'meta[name="description"]',
  'meta[name="keywords"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'link[rel="alternate"][hreflang="en"]',
  'link[rel="alternate"][hreflang="es"]',
];

const removeManagedTags = () => {
  MANAGED_SELECTORS.forEach(selector => {
    const el = document.head.querySelector(selector);
    if (el) document.head.removeChild(el);
  });
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

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', gaId);
  };

  return script;
};

export default function Head({ category, categoryName }) {
  const { isEs } = useContext(LanguageContext);
  const tr = isEs ? translations.es : translations.en;

  // GA script — mount only, never re-runs on language or category change.
  useEffect(() => {
    const script = addGoogleAnalyticsScript();
    return () => {
      if (script && script.parentNode) document.head.removeChild(script);
    };
  }, []);

  // JSON-LD structured data — static, describes the app as a whole, injected once on mount.
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-id', 'world-interests-jsonld');
    script.textContent = JSON_LD;
    document.head.appendChild(script);
    return () => {
      const el = document.head.querySelector('script[data-id="world-interests-jsonld"]');
      if (el) document.head.removeChild(el);
    };
  }, []);

  // Dynamic meta tags — re-runs whenever language or active category changes.
  useEffect(() => {
    const canonicalUrl = getCanonicalUrl();
    const screenshotUrl = window.location.origin + '/screenshot.jpg';

    const title = categoryName
      ? `${categoryName} — Trending YouTube | World Interests`
      : 'World Interests — Trending YouTube Channels by Country';

    const description = categoryName
      ? isEs
        ? `Explora los canales de YouTube de ${categoryName} en tendencia #1 en tiempo real en un mapa mundial interactivo.`
        : `Explore the #1 trending YouTube ${categoryName} channels by country in real-time on an interactive world map.`
      : tr.appMetaTagDescription;

    document.title = title;

    upsertTag('meta', 'meta[property="og:title"]', { property: 'og:title', content: title });
    upsertTag('meta', 'meta[property="og:description"]', { property: 'og:description', content: description });
    upsertTag('meta', 'meta[property="og:image"]', { property: 'og:image', content: screenshotUrl });
    upsertTag('meta', 'meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertTag('meta', 'meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertTag('meta', 'meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertTag('meta', 'meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertTag('meta', 'meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertTag('meta', 'meta[name="twitter:image"]', { name: 'twitter:image', content: screenshotUrl });
    upsertTag('meta', 'meta[name="description"]', { name: 'description', content: description });
    upsertTag('meta', 'meta[name="keywords"]', { name: 'keywords', content: KEYWORDS });
    upsertTag('meta', 'meta[name="robots"]', { name: 'robots', content: 'index, follow' });
    upsertTag('link', 'link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
    // hreflang — both point to the same URL; language is stored in localStorage, not the URL.
    upsertTag('link', 'link[rel="alternate"][hreflang="en"]', { rel: 'alternate', hreflang: 'en', href: canonicalUrl });
    upsertTag('link', 'link[rel="alternate"][hreflang="es"]', { rel: 'alternate', hreflang: 'es', href: canonicalUrl });

    return removeManagedTags;
  }, [isEs, category, categoryName]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

Head.propTypes = {
  category: PropTypes.string,
  categoryName: PropTypes.string,
};
