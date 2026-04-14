import React, { useState, useEffect, useRef, memo, useContext } from 'react';
import { MapContainer, useMap } from 'react-leaflet'
import CustomMarker from '../CustomMarker/CustomMarker';
import { getCountryLatLon, getData, getFlagFromAlpha2 } from './Points/Data';
import { processPoint } from './Points/Points';
import ImageNotFound from '../GlobalStyles/img/image-not-found.png';
import './Countries/Countries.scss';
import Countries from './Countries/Countries';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';
import { STORAGE_KEY_MAP_VIEW, ZOOM_LOW, ZOOM_HIGH, DEBUG_ZOOM_LEVEL_ENABLED } from '../config';

const DEFAULT_CENTER = [25, 0];
const DEFAULT_ZOOM = 3;

function saveMapView(center, zoom) {
  try {
    localStorage.setItem(STORAGE_KEY_MAP_VIEW, JSON.stringify({ center, zoom }));
  } catch (_) {}
}

function loadMapView() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MAP_VIEW);
    if (!raw) return null;
    const { center, zoom } = JSON.parse(raw);
    const [lat, lng] = center;
    if (
      typeof lat !== 'number' || typeof lng !== 'number' ||
      typeof zoom !== 'number' ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180 ||
      zoom < 1 || zoom > 5
    ) return null;
    return { center, zoom };
  } catch (_) {
    return null;
  }
}

function MapViewSaver() {
  const map = useMap();
  const debounceRef = useRef(null);

  useEffect(() => {
    const mapContainer = map.getContainer().parentElement;

    const syncZoomClass = () => {
      if (!mapContainer) return;
      const zoom = map.getZoom();
      mapContainer.classList.toggle('map--low-zoom', zoom < ZOOM_LOW);
      mapContainer.classList.toggle('map--max-zoom', zoom >= ZOOM_HIGH);
    };

    const save = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const { lat, lng } = map.getCenter();
        saveMapView([lat, lng], map.getZoom());
      }, 400);
    };

    const onZoomEnd = () => {
      syncZoomClass();
      save();
    };

    // Apply zoom class on mount based on initial zoom level.
    syncZoomClass();

    map.on('moveend', save);
    map.on('zoomend', onZoomEnd);
    return () => {
      map.off('moveend', save);
      map.off('zoomend', onZoomEnd);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [map]);

  return null;
}

// Debug-only component — shows current zoom level at bottom-right of the map.
// Enabled/disabled by DEBUG_ZOOM_LEVEL_ENABLED in src/config.js.
function ZoomDebugLabel() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoomEnd = () => setZoom(map.getZoom());
    map.on('zoomend', onZoomEnd);
    return () => map.off('zoomend', onZoomEnd);
  }, [map]);

  return (
    <div style={{
      position: 'absolute',
      bottom: '12px',
      right: '12px',
      zIndex: 1000,
      background: 'rgba(0,0,0,0.55)',
      color: '#fff',
      fontSize: '11px',
      fontFamily: 'monospace',
      padding: '3px 7px',
      borderRadius: '4px',
      pointerEvents: 'none',
    }}>
      zoom: {zoom}
    </div>
  );
}

function Map({ category, toggleSidebar, setMapPoint }) {
  const { isEs } = useContext(LanguageContext);
  const [data, setData] = useState({});
  const [mapError, setMapError] = useState(false);
  const prevDataRef = useRef({});

  useEffect(() => {
    setMapError(false);
    const fetchData = (category) => {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL + 'get-json.php' + '?category=' + category;
      getData(apiUrl)
        .then((result) => {
          // Compare the new data with the previous data to ensure that the state is only updated when there are real changes in the data and avoid unnecessary re-renders. Because whitout this, React is detecting the data as a new object every time even if the data is the same.
          if (JSON.stringify(result) !== JSON.stringify(prevDataRef.current)) {
            prevDataRef.current = result;
            setData(result);
          }
        })
        .catch((error) => {
          console.warn('[WorldInterests] Could not load map data for category "' + category + '":', error.message);
          setMapError(true);
          setData({});
        });
    };
    fetchData(category);
  }, [category]);

  // Retry channel images that fail to load (YouTube CDN 429 rate limiting).
  // Uses event delegation since marker images live inside Leaflet DivIcons (not React-managed).
  // Failed images are queued and retried one at a time to avoid triggering rate limits again.
  useEffect(() => {
    const retryQueue = [];
    let retryTimer = null;

    const processQueue = () => {
      if (retryQueue.length === 0) {
        retryTimer = null;
        return;
      }
      const img = retryQueue.shift();
      const originalSrc = img.dataset.originalSrc;
      if (originalSrc && document.contains(img)) {
        img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'retry=' + Date.now();
      }
      retryTimer = setTimeout(processQueue, 800);
    };

    const handleError = (e) => {
      if (e.target.tagName !== 'IMG' || !e.target.src.includes('ggpht.com')) return;
      const img = e.target;
      img.style.visibility = 'hidden';
      if (!img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src.split('?retry=')[0];
      }
      const retryCount = parseInt(img.dataset.retry || '0');
      if (retryCount < 5) {
        img.dataset.retry = String(retryCount + 1);
        retryQueue.push(img);
        if (!retryTimer) {
          retryTimer = setTimeout(processQueue, 1500);
        }
      }
    };

    const handleLoad = (e) => {
      if (e.target.tagName !== 'IMG' || !e.target.src.includes('ggpht.com')) return;
      e.target.style.visibility = 'visible';
    };

    document.addEventListener('error', handleError, true);
    document.addEventListener('load', handleLoad, true);
    return () => {
      document.removeEventListener('error', handleError, true);
      document.removeEventListener('load', handleLoad, true);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  // processPoint after a new data is fetched, to change their appearance.
  useEffect(() => {
    if (Object.keys(data).length === 0) return;

    // Compute view count range across all pins for relative normalization.
    const viewCounts = Object.keys(data)
      .map((alpha2) => Number(data[alpha2][0]?.statistics?.viewCount) || 0);
    const minViews = Math.min(...viewCounts);
    const maxViews = Math.max(...viewCounts);

    Object.keys(data).map((alpha2) => {
      const countryPoint = data[alpha2][0];
      const latLon = getCountryLatLon(alpha2);
      processPoint(countryPoint, latLon, minViews, maxViews);
    });
  }, [data]);

  const savedView = loadMapView();

  const mapConfig = {
    center: savedView ? savedView.center : DEFAULT_CENTER,
    zoom: savedView ? savedView.zoom : DEFAULT_ZOOM,
    minZoom: 1,
    maxZoom: 5,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 325,
    scrollWheelZoom: true,
    zoomControl: false,
    style: {
      background: 'var(--page-bg)',
      with: '100%',
      height: '100%'
    }
  }

  const tr = isEs ? translations.es : translations.en;

  return (
    <div className="map-container">
      {mapError && (
        <div className="map-error-overlay">
          <p>{tr.mapDataUnavailable}</p>
        </div>
      )}
      <MapContainer {...mapConfig}>
        <MapViewSaver />
        {DEBUG_ZOOM_LEVEL_ENABLED && <ZoomDebugLabel />}
        {/* This has the GeoJSON component. */}
        <Countries data={data} category={category} />

        {Object.keys(data).map((alpha2) => {
          const countryData = data[alpha2]?.[0];
          if (!countryData) return null;

          const latLon = getCountryLatLon(alpha2);
          if (!latLon) return null;

          countryData.flag = getFlagFromAlpha2(alpha2 || '');

          if (countryData.channel) {
            countryData.channel.channelImage = countryData.channel.channelImage || ImageNotFound;
          }
          const c = countryData?.channel;

          return latLon && typeof countryData !== 'undefined' ? (
            <CustomMarker key={alpha2} position={latLon} toggleSidebar={toggleSidebar} mapPoint={countryData} setMapPoint={setMapPoint} >
              <div className="custom-marker__point" data-region={countryData.regionName} data-user={c.channelUsername} data-channel-id={c.channelId}>
                <span className="custom-marker__bg bg-color"></span>
                <span className="custom-marker__bg-pointer bg-color"></span>
                <div className="image-container">
                  <img src={c.channelImage} alt="marker" loading="lazy" />
                </div>
                <span className='flag'>{countryData.flag}</span>
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

