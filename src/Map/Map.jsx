import React, { useState, useEffect, useRef, memo } from 'react';
import { MapContainer } from 'react-leaflet'
import CustomMarker from '../CustomMarker/CustomMarker';
import { getCountryLatLon, getData } from './Points/Data';
import { processPoint } from './Points/Points';
import ImageNotFound from '../GlobalStyles/img/image-not-found.png';
import './Countries/Countries.scss';
import Countries from './Countries/Countries';

function Map({ category, toggleSidebar, setMapPoint }) {
  // TODO: Center map in a better way in mobile.

  const [data, setData] = useState({});
  const prevDataRef = useRef({});

  useEffect(() => {
    const fetchData = (category) => {
      getData(category)
        .then((result) => {
          // Compare the new data with the previous data to ensure that the state is only updated when there are real changes in the data and avoid unnecessary re-renders. Because whitout this, React is detecting the data as a new object every time even if the data is the same.
          if (JSON.stringify(result) !== JSON.stringify(prevDataRef.current)) {
            prevDataRef.current = result;
            setData(result);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setData({});
        });
    };
    fetchData(category);
  }, [category]);

  // processPoint after a new data is fetched, to change their appearance.
  useEffect(() => {
    if (Object.keys(data).length === 0) return;
    Object.keys(data).map((alpha2) => {
      const countryPoint = data[alpha2][0];
      const latLon = getCountryLatLon(alpha2);
      processPoint(countryPoint, latLon);
    });
  }, [data]);

  const mapConfig = {
    center: [25, 0], // Center of the map. We set it a bit to the upper side to have a better view of the countries.
    zoom: 3,
    minZoom: 1,
    maxZoom: 5,
    scrollWheelZoom: true,
    zoomControl: false,
    style: {
      background: 'var(--page-bg)',
      with: '100%',
      height: '100%'
    }
  }

  return (
    <div className="map-container">
      <MapContainer {...mapConfig}>
        {/* This has the GeoJSON component. */}
        <Countries data={data} category={category} />

        {Object.keys(data).map((alpha2) => {
          const countryData = data[alpha2][0]
          const latLon = getCountryLatLon(alpha2);

          if (countryData && countryData.channel) {
            countryData.channel.channelImage = countryData.channel.channelImage || ImageNotFound;
          }
          const c = countryData?.channel;

          return latLon && typeof countryData !== 'undefined' ? (
            <CustomMarker key={alpha2} position={latLon} toggleSidebar={toggleSidebar} mapPoint={countryData} setMapPoint={setMapPoint} >
              <div className="custom-marker__point" data-region={countryData.regionName} data-user={c.channelUsername} data-channel-id={c.channelId}>
                <span className="custom-marker__bg bg-color"></span>
                <span className="custom-marker__bg-pointer bg-color"></span>
                <div className="image-container">
                  <img src={c.channelImage} alt="marker" />
                </div>
                <div className="text-container">
                  <span className='channel-title'>{c.channelTitle}</span>
                  <span className="location">{countryData.regionName}</span>
                </div>
              </div>
            </CustomMarker>
          ) : null
        })}

      </MapContainer>
    </div>
  )
}

export default memo(Map);

