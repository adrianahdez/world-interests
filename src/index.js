import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './main.scss';
import { LanguageProvider } from './Common/LanguageContext';
import { ThemeProvider } from './Common/ThemeContext';

// eslint-disable-next-line no-undef
if (__DEV_WARN_SITE_URL_MISSING__) {
  console.warn('[WorldInterests] ⚠️ REACT_APP_SITE_URL is not set in .env.production — sitemap, robots.txt, and JSON-LD will fall back to the hardcoded URL. Add REACT_APP_SITE_URL=https://your-domain.com to .env.production.');
}
// eslint-disable-next-line no-undef
if (__DEV_WARN_GA_ID_MISSING__) {
  console.warn('[WorldInterests] ⚠️ REACT_APP_GA_ID is not set in .env.production — GA tracking will not work in production. Add REACT_APP_GA_ID=G-XXXXXXXXXX to .env.production.');
}

// Lazy load the App component
const App = lazy(() => import('./App/App'));

const Loading = () => {
  return <div className='pageLoading'>Loading...</div>;
}

const root = createRoot(document.getElementById('app'));

// render App component with Suspense fallback
root.render(
  <Suspense fallback={<Loading />}>
    <LanguageProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LanguageProvider>
  </Suspense>
);
