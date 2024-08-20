import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './CustomMarker.css';

const CustomMarker = ({ position, children, toggleSidebar, mapPoint, setMapPoint, ...props }) => {
  const containerRef = useRef(null);
  const map = useMap(); // Get the map instance

  useEffect(() => {
    if (containerRef.current && map) {
      // Convert the React content to HTML
      const htmlContent = containerRef.current.innerHTML;

      // Create a div icon with the HTML content
      const icon = new L.DivIcon({
        className: 'custom-marker',
        html: `<div class="custom-marker__container">
                ${htmlContent}
              </div>`,
        iconSize: [50, 50],
        // iconSize: [22, 22],
        iconAnchor: [25, 50], // Position of the icon
      });

      // Create the marker with the position and the custom icon
      const marker = L.marker(position, { icon }).addTo(map);
      marker.on('click', () => {
        // The sidebar will always be opened on marker click
          toggleSidebar(true);
          // Set the map point of the InfoSidebar to the current marker point
          setMapPoint(mapPoint);
      });
      
      return () => map.removeLayer(marker); // Remove the marker when the component is unmounted
    }
  // }, [position, children, map, toggleSidebar]);
  }, [position, map, mapPoint, toggleSidebar, setMapPoint]);
  // }, [children]);
  // }, []);

  return (
    <div ref={containerRef} className='custom-marker__parent' style={{ display: 'none' }}>
      {children}
    </div>
  );
};

export default CustomMarker;