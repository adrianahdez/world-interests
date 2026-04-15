import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMap } from 'react-leaflet';
import { heatLayer } from '@linkurious/leaflet-heat';
import { getCountryLatLon } from './Points/Data';

// Heatmap options — radius/blur kept small so density differences between
// categories are visible (fewer countries → sparser map, not a global blob).
const HEATMAP_OPTIONS = {
  radius: 20,
  blur: 15,
  maxZoom: 5,
  max: 1,
  minOpacity: 0.3,
  // Blue (low) → orange (mid) → red (high)
  gradient: { 0.2: '#1a6391', 0.5: '#e05c00', 1.0: '#ff2200' },
};

// Renders a Leaflet heatmap layer from the loaded data.
// Intensity per point is the normalised view count (0–1 relative to the max across all countries).
// The layer is created once and updated via setLatLngs() to avoid the remove/re-add cycle
// that caused the old canvas to persist visually even after map.removeLayer() was called.
function HeatmapLayer({ data, visible }) {
  const map = useMap();
  const layerRef = useRef(null);

  // Create the layer once on mount, remove on unmount.
  useEffect(() => {
    const layer = heatLayer([], HEATMAP_OPTIONS);
    layerRef.current = layer;
    return () => {
      if (layerRef.current) {
        if (map.hasLayer(layerRef.current)) map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  // Update points whenever data or visibility changes.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    if (!visible || Object.keys(data).length === 0) {
      if (map.hasLayer(layer)) map.removeLayer(layer);
      return;
    }

    // Only include entries that have a channel object — same filter as markers.
    // Backend data can contain country slots without a channel (no trending video
    // for that category in that country); those must not appear on the heatmap.
    const entries = Object.keys(data)
      .map(a2 => ({ a2, entry: data[a2]?.[0] }))
      .filter(({ entry }) => entry?.channel);

    const viewCounts = entries.map(({ entry }) => Number(entry.statistics?.viewCount) || 0);
    const maxViews = Math.max(...viewCounts, 1);

    const points = entries.map(({ a2, entry }) => {
      const latLon = getCountryLatLon(a2);
      if (!latLon) return null;
      const intensity = (Number(entry.statistics?.viewCount) || 0) / maxViews;
      return [latLon[0], latLon[1], intensity];
    }).filter(Boolean);

    console.log('[WorldInterests] HeatmapLayer: building with', points.length, 'points');

    // setLatLngs replaces the point set and calls redraw() internally,
    // so the canvas is updated in-place without a remove/re-add cycle.
    layer.setLatLngs(points);
    if (!map.hasLayer(layer)) layer.addTo(map);
  }, [data, visible, map]);

  return null;
}

HeatmapLayer.propTypes = {
  data: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default HeatmapLayer;
