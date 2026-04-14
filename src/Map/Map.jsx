import React, { useState, useEffect, useRef, useCallback, memo, useContext } from 'react';
import { MapContainer, useMap } from 'react-leaflet'
import CustomMarker from '../CustomMarker/CustomMarker';
import { getCountryLatLon, getData, getFlagFromAlpha2 } from './Points/Data';
import { processPoint } from './Points/Points';
import ImageNotFound from '../GlobalStyles/img/image-not-found.png';
import './Countries/Countries.scss';
import Countries from './Countries/Countries';
import { LanguageContext } from '../Common/LanguageContext';
import translations from '../Common/translations';
import { STORAGE_KEY_MAP_VIEW, ZOOM_VERY_LOW, ZOOM_LOW, ZOOM_HIGH, DEBUG_ZOOM_LEVEL_ENABLED, GESTURE_HANDLING_ENABLED, COUNTRY_HOVER_LABEL_ENABLED, CLUSTERING_ENABLED } from '../config';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.min.css';
import 'leaflet-gesture-handling';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';

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
      // Shrink pins and hide flags at low zoom.
      mapContainer.classList.toggle('map--low-zoom', zoom < ZOOM_LOW);
      // Extra-small pins at very low zoom (below 2).
      mapContainer.classList.toggle('map--very-low-zoom', zoom < ZOOM_VERY_LOW);
      // At maximum zoom, reveal channel name + view count directly on pins (no hover needed).
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

// Shows the name of the country currently hovered on the map polygon layer.
// Updated via a DOM ref to avoid re-rendering Map (and its markers) on every hover event.
// Sits above ZoomDebugLabel. Enabled/disabled by COUNTRY_HOVER_LABEL_ENABLED in src/config.js.
function HoverCountryLabel({ labelRef }) {
  return (
    <div
      ref={labelRef}
      style={{
        display: 'none',
        position: 'absolute',
        bottom: '38px',
        right: '12px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        fontSize: '11px',
        fontFamily: 'monospace',
        padding: '3px 7px',
        borderRadius: '4px',
        pointerEvents: 'none',
      }}
    />
  );
}

// Creates a native Leaflet MarkerClusterGroup, adds it to the map, and stores it in clusterGroupRef
// so CustomMarker can add markers directly into it. Must render before the markers.
function ClusterGroupSetup({ clusterGroupRef }) {
  const map = useMap();
  useEffect(() => {
    const group = L.markerClusterGroup({
      chunkedLoading: true,
      disableClusteringAtZoom: 4,
      maxClusterRadius: 80,
    });
    map.addLayer(group);
    clusterGroupRef.current = group;
    return () => {
      map.removeLayer(group);
      clusterGroupRef.current = null;
    };
  }, [map, clusterGroupRef]);
  return null;
}

function Map({ category, toggleSidebar, setMapPoint, restoreRegion }) {
  const { isEs } = useContext(LanguageContext);
  const [data, setData] = useState({});
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true until first data fetch resolves
  const [retryCount, setRetryCount] = useState(0); // current retry attempt (0 = first try, 1-3 = retrying)
  const hoverLabelRef = useRef(null); // ref to HoverCountryLabel DOM node — updated directly to avoid re-renders
  const clusterGroupRef = useRef(null); // ref to the native Leaflet MarkerClusterGroup layer
  const prevDataRef = useRef({});
  // Tracks whether the sidebar restore has already fired, so it only runs once per session.
  const restoredRef = useRef(false);

  useEffect(() => {
    setMapError(false);
    setIsLoading(true);
    setRetryCount(0);

    let cancelled = false;
    let retryTimer = null;
    // Exponential backoff delays: 2s, 4s, 8s (max 3 retries).
    const RETRY_DELAYS = [2000, 4000, 8000];

    const attempt = (attemptIndex) => {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL + 'get-json.php' + '?category=' + category;
      getData(apiUrl)
        .then((result) => {
          if (cancelled) return;
          setRetryCount(0);
          // Only update state when data actually changed to avoid unnecessary re-renders.
          if (JSON.stringify(result) !== JSON.stringify(prevDataRef.current)) {
            prevDataRef.current = result;
            setData(result);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          if (cancelled) return;
          if (attemptIndex < RETRY_DELAYS.length) {
            // Schedule next retry and show the attempt counter in the UI.
            setRetryCount(attemptIndex + 1);
            retryTimer = setTimeout(() => attempt(attemptIndex + 1), RETRY_DELAYS[attemptIndex]);
          } else {
            // All retries exhausted — surface the error.
            console.warn('[WorldInterests] Could not load map data for category "' + category + '" after ' + (RETRY_DELAYS.length + 1) + ' attempts:', error.message);
            setRetryCount(0);
            setMapError(true);
            setIsLoading(false);
            setData({});
          }
        });
    };

    attempt(0);

    return () => {
      // Cancel in-flight retries when category changes or component unmounts.
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
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

  // Restore the sidebar for the last open country after data loads (once per session).
  useEffect(() => {
    if (!restoreRegion || restoredRef.current || Object.keys(data).length === 0) return;
    const alpha2 = Object.keys(data).find(key => data[key][0]?.regionName === restoreRegion);
    if (!alpha2) return;
    restoredRef.current = true; // prevent re-firing on subsequent data refreshes
    const point = data[alpha2][0];
    point.flag = getFlagFromAlpha2(alpha2);
    if (point.channel) point.channel.channelImage = point.channel.channelImage || ImageNotFound;
    setMapPoint(point);
    toggleSidebar(true);
  }, [data, restoreRegion, setMapPoint, toggleSidebar]);

  // Updates the hover label DOM node directly — avoids re-rendering Map and its markers.
  const handleCountryHover = useCallback((name) => {
    const el = hoverLabelRef.current;
    if (!el) return;
    if (name) {
      el.textContent = name;
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  }, []);

  const savedView = loadMapView();

  const mapConfig = {
    center: savedView ? savedView.center : DEFAULT_CENTER,
    zoom: savedView ? savedView.zoom : DEFAULT_ZOOM,
    minZoom: 1,
    maxZoom: 5,
    zoomSnap: 0.5,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 325,
    // When gesture handling is on, the plugin takes over scroll zoom — disable the default.
    scrollWheelZoom: !GESTURE_HANDLING_ENABLED,
    gestureHandling: GESTURE_HANDLING_ENABLED,
    zoomControl: false,
    style: {
      background: 'var(--page-bg)',
      with: '100%',
      height: '100%'
    }
  }

  const tr = isEs ? translations.es : translations.en;

  // Extracted so the same JSX can be rendered directly or inside MarkerClusterGroup.
  const renderMarkers = () => Object.keys(data).map((alpha2) => {
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
      <CustomMarker key={alpha2} position={latLon} toggleSidebar={toggleSidebar} mapPoint={countryData} setMapPoint={setMapPoint} clusterLayerRef={CLUSTERING_ENABLED ? clusterGroupRef : null}>
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
    ) : null;
  });

  return (
    <div className="map-container">
      {isLoading && !mapError && (
        <div className="map-loading-overlay">
          <div className="map-loading-overlay__spinner" />
          {retryCount > 0 && (
            <p className="map-loading-overlay__retry">{tr.retrying} ({retryCount}/3)…</p>
          )}
        </div>
      )}
      {mapError && (
        <div className="map-error-overlay">
          <p>{tr.mapDataUnavailable}</p>
        </div>
      )}
      <MapContainer {...mapConfig}>
        <MapViewSaver />
        {DEBUG_ZOOM_LEVEL_ENABLED && <ZoomDebugLabel />}
        {COUNTRY_HOVER_LABEL_ENABLED && <HoverCountryLabel labelRef={hoverLabelRef} />}
        {/* This has the GeoJSON component. */}
        <Countries data={data} category={category} onCountryHover={COUNTRY_HOVER_LABEL_ENABLED ? handleCountryHover : undefined} />

        {/* ClusterGroupSetup must appear before the markers so its effect runs first. */}
        {CLUSTERING_ENABLED && <ClusterGroupSetup clusterGroupRef={clusterGroupRef} />}
        {renderMarkers()}

      </MapContainer>
    </div>
  )
}

export default memo(Map);

