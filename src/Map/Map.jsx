import countries from './countries.geo.json';
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, GeoJSON, Marker } from 'react-leaflet'
// import { useMap, useMapEvent } from 'react-leaflet';
import { setConfig } from './geoJsonConfig';
import CustomMarker from '../CustomMarker/CustomMarker';
import { getCountryLatLon, getData } from './Data';
import { processPoint } from './Points';

// Know the center of the map.
// function MyComponent() {
//   const map = useMap()
//   console.log('map center:', map.getCenter())
//   return null
// }

// Know the location of the clicked point. Require user permission to access the location.
// function MyComponent() {
//   const map = useMapEvents({
//     click: () => {
//       map.locate()
//     },
//     locationfound: (location) => {
//       console.log('location found:', location)
//     },
//   })
//   return null
// }

// Re center to the point after clicking anywhere on the map.
// function Click({ position }) {
//   const map = useMapEvent('click', () => {
//     map.setView(position, map.getZoom())
//     console.log('map center:', map.getCenter());
//   })
//   return null
// }

export default function Map() {
  // TODO: Center map in a better way in mobile.

  const [data, setData] = useState({});
  const prevDataRef = useRef({});
  const fetchInterval = 20000;

  useEffect(() => {
    const fetchData = () => {
      getData()
        .then((result) => {
          // Compare the new data with the previous data to ensure that the state is only updated when there are real changes in the data and avoid unnecessary re-renders. Because whitout this, React is detecting the data as a new object every time even if the data is the same.
          if (JSON.stringify(result) !== JSON.stringify(prevDataRef.current)) {
            setData(result);
          }
        })
        .catch((error) => {
          setData({});
          console.error('Error:', error);
        });
    };
    fetchData();
    const interval = setInterval(fetchData, fetchInterval);
    return () => clearInterval(interval);
  }, []);

  // processPoint after a new data is fetched, to change their appearance a little bit/
  useEffect(() => {
    if (Object.keys(data).length === 0) return;
    Object.keys(data).map((alpha2) => {
      const countryPoint = data[alpha2][0];
      const latLon = getCountryLatLon(alpha2);
      processPoint(countryPoint, latLon);
    });
  }, [data]);

  const mapConfig = {
    center: [0, 0],
    zoom: 3,
    minZoom: 3,
    maxZoom: 5,
    scrollWheelZoom: true,
    zoomControl: false,
    style: {
      background: '#1a3f49',
      with: '100%',
      height: '100%'
    }
  }

  const handleMarkerClick = (e) => {
    console.log('marker clicked', e);
  }

  // Remove old markers before the new ones are rendered.
  // Because the markers are not removed from the map when the data is updated.
  const markers = document.querySelectorAll('.custom-marker');
  if (JSON.stringify(data) !== JSON.stringify(prevDataRef.current)) {
    markers.forEach((marker) => {
      marker.remove();
    });
    // Update the previous data with the new data. This line must be after the markers are removed and not in the useEffect because it will cause an infinite loop.
    prevDataRef.current = data;
  }

  return (
    <div className="map-container">
      <MapContainer {...mapConfig}>
        <GeoJSON data={countries} style={setConfig} />
        {/* <MyComponent /> */}

        {/* <Marker position={markerPosition} opacity={.6} eventHandlers={{ click: () => handleMarkerClick() }}>
        </Marker> */}

        {Object.keys(data).map((alpha2) => {

          const regionPoint = data[alpha2][0]
          const latLon = getCountryLatLon(alpha2);
          const c = regionPoint.channel;

          return latLon ? (
            <CustomMarker key={alpha2} position={latLon} opacity={0.6}>
              <div className="custom-marker__point" data-region={regionPoint.regionName} data-user={c.channelUsername}>
                <span className="custom-marker__bg bg-color"></span>
                <span className="custom-marker__bg-pointer bg-color"></span>
                <div className="image-container">
                  <img src={c.channelImage} alt="marker" />
                </div>
                <a className="text-container" target="_blank" href={`https://youtube.com/${c.channelUsername}`}>
                  <span className='channel-title'>{c.channelTitle}</span>
                  <span className="location">{regionPoint.regionName}</span>
                </a>
              </div>
            </CustomMarker>
          ) : null
        })}

      </MapContainer>
    </div>
  )
}


