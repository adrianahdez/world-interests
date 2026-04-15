import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './CustomMarker.scss';

const CustomMarker = ({ position, children, toggleSidebar, mapPoint, setMapPoint, clusterLayerRef = null, markerPane = null, ariaLabel = '', ...props }) => {
  const containerRef = useRef(null);
  const map = useMap(); // Get the map instance

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
        iconSize: [50, 50],
        // iconSize: [22, 22],
        iconAnchor: [25, 50], // Position of the icon
      });

      // Add to the cluster group if provided, otherwise directly to the map.
      const target = clusterLayerRef?.current || map;
      const markerOptions = { icon };
      // Assign to the dedicated marker pane (z-index 400) when provided.
      if (markerPane) markerOptions.pane = markerPane;
      const marker = L.marker(position, markerOptions).addTo(target);
      marker.on('click', () => {
        // The sidebar will always be opened on marker click
          toggleSidebar(true);
          // Set the map point of the InfoSidebar to the current marker point
          setMapPoint(mapPoint);
      });

      // Keyboard navigation: Enter or Space opens the sidebar, matching click behaviour.
      const markerEl = marker.getElement();
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleSidebar(true);
          setMapPoint(mapPoint);
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
  }, [position, map, mapPoint, toggleSidebar, setMapPoint, clusterLayerRef, markerPane, ariaLabel]);
  // }, [children]);
  // }, []);

  return (
    <div ref={containerRef} className='custom-marker__parent' style={{ display: 'none' }}>
      {children}
    </div>
  );
};

export default CustomMarker;