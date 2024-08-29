import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './main.scss';
import { LanguageProvider } from './Common/LanguageContext';
import { ThemeProvider } from './Common/ThemeContext';

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
