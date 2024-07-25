import React from 'react';
import { createRoot } from 'react-dom/client';
import Map from './Map/Map';
import 'leaflet/dist/leaflet.css';

const root = createRoot(document.getElementById('app'));
// render Map component
root.render(<Map />);
