import React, { useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './CustomMarker.scss';
import { MapPointContext } from '../Common/MapPointContext';
import { SidebarContext } from '../Common/SidebarContext';
import { MARKER_ICON_SIZE, MARKER_ICON_ANCHOR } from '../config';

// markerData: the country data object for THIS marker (not the globally selected mapPoint).
// When clicked, it is pushed into MapPointContext so InfoSidebar can display it.
const CustomMarker = ({ position, children, markerData, clusterLayerRef = null, markerPane = null, ariaLabel = '', ...props }) => {
  const containerRef = useRef(null);
  const map = useMap();
  const { setMapPoint } = useContext(MapPointContext);
  const { toggleSidebar } = useContext(SidebarContext);

  useEffect(() => {
    if (containerRef.current && map) {
      // Convert the React content to HTML
      const htmlContent = containerRef.current.innerHTML;

      // Create a div icon with the HTML content
      const icon = new L.DivIcon({
        className: 'custom-marker',
        html: `<div class="custom-marker__container" role="button" tabindex="0" aria-label="${ariaLabel}">
                ${htmlContent}
              </div>`,
        iconSize: MARKER_ICON_SIZE,
        iconAnchor: MARKER_ICON_ANCHOR, // bottom-centre of the icon sits on the coordinate point
      });

      // Add to the cluster group if provided, otherwise directly to the map.
      const target = clusterLayerRef?.current || map;
      const markerOptions = { icon };
      // Assign to the dedicated marker pane (z-index 400) when provided.
      if (markerPane) markerOptions.pane = markerPane;
      const marker = L.marker(position, markerOptions).addTo(target);
      marker.on('click', () => {
        toggleSidebar(true);
        setMapPoint(markerData);
      });

      // Keyboard navigation: Enter or Space opens the sidebar, matching click behaviour.
      const markerEl = marker.getElement();
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSidebar(true);
          setMapPoint(markerData);
        }
      };
      if (markerEl) {
        markerEl.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        if (markerEl) markerEl.removeEventListener('keydown', handleKeyDown);
        if (clusterLayerRef?.current) {
          clusterLayerRef.current.removeLayer(marker);
        } else {
          map.removeLayer(marker);
        }
      };
    }
  }, [position, map, markerData, toggleSidebar, setMapPoint, clusterLayerRef, markerPane, ariaLabel]);

  return (
    <div ref={containerRef} className='custom-marker__parent' style={{ display: 'none' }}>
      {children}
    </div>
  );
};

CustomMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  children: PropTypes.node.isRequired,
  markerData: PropTypes.object.isRequired,
  clusterLayerRef: PropTypes.object,
  markerPane: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default CustomMarker;
