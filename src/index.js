import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './main.css';
import { LanguageProvider } from './Common/LanguageContext';

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
      <App />
    </LanguageProvider>
  </Suspense>
);
