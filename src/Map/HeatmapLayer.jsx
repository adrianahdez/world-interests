import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { heatLayer } from '@linkurious/leaflet-heat';
import { getCountryLatLon } from './Points/Data';

// Renders a Leaflet heatmap layer from the loaded data.
// Intensity per point is the normalised view count (0–1 relative to the max across all countries).
// Added/removed from the map based on the `visible` prop; rebuilt whenever `data` changes.
function HeatmapLayer({ data, visible }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!visible || Object.keys(data).length === 0) return;

    const viewCounts = Object.keys(data).map(a2 => Number(data[a2][0]?.statistics?.viewCount) || 0);
    const maxViews = Math.max(...viewCounts, 1);

    const points = Object.keys(data).map(a2 => {
      const latLon = getCountryLatLon(a2);
      if (!latLon) return null;
      const intensity = (Number(data[a2][0]?.statistics?.viewCount) || 0) / maxViews;
      return [latLon[0], latLon[1], intensity];
    }).filter(Boolean);

    const layer = heatLayer(points, {
      radius: 40,
      blur: 30,
      maxZoom: 5,
      max: 1,
      minOpacity: 0.3,
      // Blue (low) → orange (mid) → red (high)
      gradient: { 0.2: '#1a6391', 0.5: '#e05c00', 1.0: '#ff2200' },
    });
    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [data, visible, map]);

  return null;
}

export default HeatmapLayer;
