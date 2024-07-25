import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
// import Map from './Map/Map';
import 'leaflet/dist/leaflet.css';
import './main.css';

// Lazy load the Map component
const Map = lazy(() => import('./Map/Map'));

const Loading = () => {
  return <div>Loading...</div>;
}

const root = createRoot(document.getElementById('app'));

// render Map component with Suspense fallback
root.render(
  <Suspense fallback={<Loading />}>
    <Map />
  </Suspense>
);
