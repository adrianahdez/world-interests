import React, { useState, useEffect, useRef, useCallback, useMemo, memo, useContext } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, useMap, Pane } from 'react-leaflet'
import CustomMarker from '../CustomMarker/CustomMarker';
import { getCountryLatLon, getFlagFromAlpha2 } from './Points/Data';
import { processPoint } from './Points/Points';
import { useMapData } from '../hooks/useMapData';
import { useImageRetry } from '../hooks/useImageRetry';
import ImageNotFound from '../GlobalStyles/img/image-not-found.png';
import './Countries/Countries.scss';
import Countries from './Countries/Countries';
import { LanguageContext } from '../Common/LanguageContext';
import { MapPointContext } from '../Common/MapPointContext';
import { SidebarContext } from '../Common/SidebarContext';
import translations from '../Common/translations';
import { STORAGE_KEY_MAP_VIEW, STORAGE_KEY_HEATMAP, STORAGE_KEY_CLUSTERING, STORAGE_KEY_FLAGS, STORAGE_KEY_LABELS, ZOOM_VERY_LOW, ZOOM_LOW, ZOOM_HIGH, DEBUG_ZOOM_LEVEL_ENABLED, GESTURE_HANDLING_ENABLED, COUNTRY_HOVER_LABEL_ENABLED, CLUSTERING_ENABLED, FULLSCREEN_ENABLED, FLAGS_VISIBLE, HEATMAP_ENABLED, LABELS_VISIBLE } from '../config';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.min.css';
import 'leaflet-gesture-handling';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import HeatmapLayer from './HeatmapLayer';
import MapSettings from './MapSettings/MapSettings';

const DEFAULT_CENTER = [25, 0];
const DEFAULT_ZOOM = 3;

function saveMapView(center, zoom) {
  try {
    localStorage.setItem(STORAGE_KEY_MAP_VIEW, JSON.stringify({ center, zoom }));
  } catch (e) {
    console.warn('[WorldInterests] Could not save map view to localStorage:', e.message);
  }
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

// Debug-only — stays inside MapContainer to access useMap(), but renders nothing.
// Updates the external zoomRef DOM node directly to avoid re-rendering Map on zoom.
function ZoomDebugUpdater({ zoomRef }) {
  const map = useMap();
  useEffect(() => {
    if (zoomRef.current) zoomRef.current.textContent = `zoom: ${map.getZoom()}`;
    const onZoomEnd = () => {
      if (zoomRef.current) zoomRef.current.textContent = `zoom: ${map.getZoom()}`;
    };
    map.on('zoomend', onZoomEnd);
    return () => map.off('zoomend', onZoomEnd);
  }, [map, zoomRef]);
  return null;
}

// Creates a native Leaflet MarkerClusterGroup, adds it to the map, and stores it in clusterGroupRef
// so CustomMarker can add markers directly into it. Must render before the markers.
function ClusterGroupSetup({ clusterGroupRef, processAllPointsRef }) {
  const map = useMap();
  useEffect(() => {
    const group = L.markerClusterGroup({
      chunkedLoading: true,
      disableClusteringAtZoom: 3,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: false, // zoom to bounds instead of spreading pins with lines
    });
    map.addLayer(group);
    clusterGroupRef.current = group;

    // After each cluster animation (zoom in/out), re-apply padding/opacity/colour
    // because the cluster group re-creates marker DOM elements on every zoom change.
    const onAnimationEnd = () => processAllPointsRef.current?.();
    group.on('animationend', onAnimationEnd);

    return () => {
      group.off('animationend', onAnimationEnd);
      map.removeLayer(group);
      clusterGroupRef.current = null;
    };
  }, [map, clusterGroupRef, processAllPointsRef]);
  return null;
}


// Exposes map.setView() to components outside MapContainer via a callback ref.
function MapFlyToSetup({ flyToRef }) {
  const map = useMap();
  useEffect(() => {
    flyToRef.current = (latLon) => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      map.setView(latLon, map.getZoom(), { animate: !prefersReduced });
    };
    return () => { flyToRef.current = null; };
  }, [map, flyToRef]);
  return null;
}

// Creates the 'map-markers' pane at z-index 400, above the default overlayPane (400)
// and tilePane (200), so markers always render on top of country polygons.
function MarkerPaneSetup() {
  const map = useMap();
  useEffect(() => {
    if (!map.getPane('map-markers')) {
      const pane = map.createPane('map-markers');
      pane.style.zIndex = 400;
    }
  }, [map]);
  return null;
}

function Map({ category, categoryName, restoreRegion, restoreChannelAlpha2, onChannelRestored, footerVisible, onFooterToggle, countryChannels, onCountryChannelsChange }) {
  const { isEs } = useContext(LanguageContext);
  const { setMapPoint } = useContext(MapPointContext);
  const { toggleSidebar } = useContext(SidebarContext);
  const { data, isLoading, mapError, retryCount } = useMapData(category);
  useImageRetry();
  const [heatmapVisible, setHeatmapVisible] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY_HEATMAP);
      return v !== null ? v === 'true' : HEATMAP_ENABLED;
    } catch (_) { return HEATMAP_ENABLED; }
  });
  const [clusteringEnabled, setClusteringEnabled] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY_CLUSTERING);
      return v !== null ? v === 'true' : CLUSTERING_ENABLED;
    } catch (_) { return CLUSTERING_ENABLED; }
  });
  const [flagsVisible, setFlagsVisible] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY_FLAGS);
      return v !== null ? v === 'true' : FLAGS_VISIBLE;
    } catch (_) { return FLAGS_VISIBLE; }
  });
  const [labelsVisible, setLabelsVisible] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY_LABELS);
      return v !== null ? v === 'true' : LABELS_VISIBLE;
    } catch (_) { return LABELS_VISIBLE; }
  });
  // Fullscreen is intentionally NOT persisted — the browser blocks auto-entering fullscreen
  // on page load, which would leave the toggle stuck in the ON state without actually being
  // in fullscreen. Always start from the config default each session.
  const [fullscreenEnabled, setFullscreenEnabled] = useState(FULLSCREEN_ENABLED);
  const hoverLabelRef = useRef(null); // ref to hover-country label DOM node — updated directly to avoid re-renders
  const zoomLabelRef = useRef(null);  // ref to zoom debug label DOM node — updated by ZoomDebugUpdater
  const mapContainerRef = useRef(null); // ref to the .map-container div — used for imperative class toggling
  const clusterGroupRef = useRef(null); // ref to the native Leaflet MarkerClusterGroup layer
  const processAllPointsRef = useRef(null); // ref to processPoint runner — called after cluster animation ends
  const flyToRef = useRef(null); // set by MapFlyToSetup; calls map.setView() from outside MapContainer
  // Tracks whether the sidebar restore has already fired, so it only runs once per session.
  const restoredRef = useRef(false);

  // processPoint after a new data is fetched, to change their appearance.
  // Also keeps processAllPointsRef up to date so ClusterGroupSetup can re-run it after
  // cluster animation ends (markers are re-created by the cluster group on zoom).
  // Registers a single debounced resize listener here instead of inside processPoint,
  // preventing the per-point listener accumulation that caused a memory leak on category switch.
  useEffect(() => {
    if (Object.keys(data).length === 0) return;

    // Compute view count range across all pins for relative normalization.
    const viewCounts = Object.keys(data)
      .map((alpha2) => Number(data[alpha2][0]?.statistics?.viewCount) || 0);
    const minViews = Math.min(...viewCounts);
    const maxViews = Math.max(...viewCounts);

    const runProcessPoint = () => {
      Object.keys(data).forEach((alpha2) => {
        const countryPoint = data[alpha2][0];
        const latLon = getCountryLatLon(alpha2);
        processPoint(countryPoint, latLon, minViews, maxViews);
      });
    };

    // Store so ClusterGroupSetup can call it on animationend.
    processAllPointsRef.current = runProcessPoint;
    runProcessPoint();

    // Single debounced resize listener for all points — registered once per data load,
    // not once per country. Cleaned up when data changes or component unmounts.
    let resizeTimer = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(runProcessPoint, 300); // 300ms debounce
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [data]);

  // Restore the sidebar for the last open country after data loads (once per session).
  useEffect(() => {
    if (!restoreRegion || restoredRef.current || Object.keys(data).length === 0) return;
    const alpha2 = Object.keys(data).find(key => {
      const rn = data[key][0]?.regionName;
      return (typeof rn === 'object' ? rn?.en : rn) === restoreRegion;
    });
    if (!alpha2) return;
    restoredRef.current = true; // prevent re-firing on subsequent data refreshes
    const point = data[alpha2][0];
    point.flag = getFlagFromAlpha2(alpha2);
    point.alpha2 = alpha2;
    if (point.channel) point.channel.channelImage = point.channel.channelImage || ImageNotFound;
    setMapPoint(point);
    toggleSidebar(true);
  }, [data, restoreRegion, setMapPoint, toggleSidebar]);

  // Restore the channel panel from a ?channel=<channelId> URL param (deep-link or Back/Forward).
  // Scans the loaded map data for the entry whose channel.channelId matches.
  // onChannelRestored clears the pending ID in App.jsx so this only runs once per navigation.
  useEffect(() => {
    if (!restoreChannelAlpha2 || Object.keys(data).length === 0) return;
    const alpha2 = Object.keys(data).find(k => data[k][0]?.channel?.channelId === restoreChannelAlpha2);
    if (!alpha2) {
      // Channel ID in the URL doesn't exist in the loaded data (stale link, manual edit,
      // or category changed). Strip the param so we don't keep trying to restore it, and
      // clear the pending state so App.jsx stops handing us the orphan ID.
      const params = new URLSearchParams(window.location.search);
      params.delete('channel');
      const search = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (search ? '?' + search : ''));
      onChannelRestored?.();
      return;
    }
    const point = data[alpha2][0];
    const p = { ...point, flag: getFlagFromAlpha2(alpha2), alpha2 };
    if (p.channel) p.channel = { ...p.channel, channelImage: p.channel.channelImage || ImageNotFound };
    setMapPoint(p);
    toggleSidebar(true);
    onChannelRestored?.();
  }, [restoreChannelAlpha2, data, setMapPoint, toggleSidebar, onChannelRestored]);

  // Persist settings to localStorage so they survive page reloads.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_HEATMAP, String(heatmapVisible)); }
    catch (e) { console.warn('[WorldInterests] Could not save heatmap setting:', e.message); }
  }, [heatmapVisible]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_CLUSTERING, String(clusteringEnabled)); }
    catch (e) { console.warn('[WorldInterests] Could not save clustering setting:', e.message); }
  }, [clusteringEnabled]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_FLAGS, String(flagsVisible)); }
    catch (e) { console.warn('[WorldInterests] Could not save flags setting:', e.message); }
  }, [flagsVisible]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_LABELS, String(labelsVisible)); }
    catch (e) { console.warn('[WorldInterests] Could not save labels setting:', e.message); }
  }, [labelsVisible]);
  // Apply flag visibility class imperatively so React re-renders don't wipe the zoom
  // classes that MapViewSaver adds to the same element via classList.toggle.
  useEffect(() => {
    mapContainerRef.current?.classList.toggle('map--flags-hidden', !flagsVisible);
  }, [flagsVisible]);

  // Re-apply processPoint styling after clustering toggle — markers are recreated when the
  // cluster group is added/removed, so DOM-level styles need to be reapplied.
  useEffect(() => {
    const t = setTimeout(() => processAllPointsRef.current?.(), 50);
    return () => clearTimeout(t);
  }, [clusteringEnabled]);

  // Sync fullscreen state when the user exits via the Escape key or browser UI.
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setFullscreenEnabled(false);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Enter/exit fullscreen directly from the user gesture so the browser allows it.
  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
        .then(() => setFullscreenEnabled(true))
        .catch(() => {});
    } else {
      document.exitFullscreen?.()
        .then(() => setFullscreenEnabled(false))
        .catch(() => {});
    }
  }, []);

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

  // Stable position references per alpha2 — recomputed only when data changes.
  // getCountryLatLon returns a new array on every call, so without memoisation
  // a language switch re-render would recreate all markers and drop processPoint styling.
  const markerPositions = useMemo(() => {
    const pos = {};
    Object.keys(data).forEach(a2 => { pos[a2] = getCountryLatLon(a2); });
    return pos;
  }, [data]);

  // Find the pin with the highest view count across all countries for the current category.
  // Ties are broken by array order (first occurrence wins).
  const mostViewedPoint = useMemo(() => {
    const alpha2Keys = Object.keys(data);
    if (alpha2Keys.length === 0) return null;
    const bestAlpha2 = alpha2Keys.reduce((best, a2) => {
      const views = parseInt(data[a2][0]?.statistics?.viewCount, 10) || 0;
      const bestViews = parseInt(data[best][0]?.statistics?.viewCount, 10) || 0;
      return views > bestViews ? a2 : best;
    });
    const point = data[bestAlpha2][0];
    if (!point?.channel) return null;
    return {
      ...point,
      flag: getFlagFromAlpha2(bestAlpha2),
      alpha2: bestAlpha2,
      channel: { ...point.channel, channelImage: point.channel.channelImage || ImageNotFound },
    };
  }, [data]);

  // Must be defined after mostViewedPoint so the dep array captures the real value.
  const handleMostViewedClick = useCallback(() => {
    if (!mostViewedPoint) return;
    // Open the sidebar first — matching the order used in CustomMarker to guarantee
    // the dialog opens even if the map animation below throws unexpectedly.
    toggleSidebar(true);
    setMapPoint(mostViewedPoint);
    try {
      const latLon = getCountryLatLon(mostViewedPoint.alpha2);
      if (latLon) flyToRef.current?.(latLon);
    } catch (_) {}
  }, [mostViewedPoint, setMapPoint, toggleSidebar]);

  // Memoized so Leaflet only unmounts/remounts markers when data or clustering mode changes.
  // Avoids marker flicker on unrelated state updates (settings toggles, hover events, etc.).
  const markers = useMemo(() => Object.keys(data).map((alpha2) => {
    const countryData = data[alpha2]?.[0];
    if (!countryData) return null;

    const latLon = markerPositions[alpha2];
    if (!latLon) {
      console.warn('[WorldInterests] No coordinates found for alpha2:', alpha2);
      return null;
    }

    const c = countryData.channel;
    if (!c) {
      console.warn('[WorldInterests] No channel data for country:', alpha2, countryData.regionName);
      return null;
    }

    countryData.flag = getFlagFromAlpha2(alpha2 || '');
    countryData.alpha2 = alpha2;
    c.channelImage = c.channelImage || ImageNotFound;

    // Canonical EN key for data-region (DOM lookup + localStorage); localized value for display.
    const rn = countryData.regionName;
    const regionEn = typeof rn === 'object' ? (rn?.en ?? '') : (rn ?? '');
    const regionDisplay = typeof rn === 'object' ? (rn?.[isEs ? 'es' : 'en'] ?? rn?.en ?? '') : (rn ?? '');

    return (
      <CustomMarker key={alpha2} position={latLon} markerData={countryData} clusterLayerRef={clusteringEnabled ? clusterGroupRef : null} markerPane="map-markers" ariaLabel={`${regionDisplay}${c.channelTitle ? ` — ${c.channelTitle}` : ''}`}>
        <div className="custom-marker__point" data-region={regionEn} data-user={c.channelUsername} data-channel-id={c.channelId}>
          <span className="custom-marker__bg bg-color"></span>
          <span className="custom-marker__bg-pointer bg-color"></span>
          <div className="image-container">
            <img src={c.channelImage} alt={c.channelTitle || 'Channel logo'} loading="lazy" referrerPolicy="no-referrer" />
          </div>
          <span className='flag'>{countryData.flag}</span>
          <div className="text-container">
            <span className='channel-title'>{c.channelTitle}</span>
            <span className="location">{regionDisplay}</span>
          </div>
        </div>
      </CustomMarker>
    );
  // isEs is intentional: language switch must rebuild the DivIcons so labels re-render.
  // markerPositions is derived from data — no separate dep needed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data, clusteringEnabled, isEs]);

  return (
    <div ref={mapContainerRef} className="map-container" role="region" aria-label={tr.mapAriaLabel}>
      {isLoading && !mapError && (
        <div className="map-loading-overlay" role="status" aria-live="polite">
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
      <div className={`map-overlay-labels${labelsVisible ? '' : ' map-overlay-labels--hidden'}`}>
        {categoryName && (
          <div className="map-overlay-label map-overlay-label--category-active" aria-label={`${tr.category}${categoryName}`}>
            {tr.category}{categoryName}
          </div>
        )}
        {DEBUG_ZOOM_LEVEL_ENABLED && <div ref={zoomLabelRef} className="map-overlay-label map-overlay-label--zoom" />}
        {mostViewedPoint && (
          <button
            type="button"
            className="map-overlay-label map-overlay-label--most-viewed"
            onClick={handleMostViewedClick}
            title={categoryName ? `${tr.mostViewedTooltip} ${categoryName}` : undefined}
          >
            {'🏆 '}
            <span className="map-overlay-label__truncated">{mostViewedPoint.channel?.channelTitle}</span>
            {' · '}
            <span className="map-overlay-label__truncated">{mostViewedPoint.videoTitle}</span>
          </button>
        )}
        {COUNTRY_HOVER_LABEL_ENABLED && <div ref={hoverLabelRef} className="map-overlay-label map-overlay-label--country map-overlay-label--dynamic" style={{ display: 'none' }} />}
      </div>
      <MapSettings
        heatmapVisible={heatmapVisible}
        onHeatmapToggle={() => setHeatmapVisible(v => !v)}
        clusteringEnabled={clusteringEnabled}
        onClusteringToggle={() => setClusteringEnabled(v => !v)}
        fullscreenEnabled={fullscreenEnabled}
        onFullscreenToggle={handleFullscreenToggle}
        flagsVisible={flagsVisible}
        onFlagsToggle={() => setFlagsVisible(v => !v)}
        footerVisible={footerVisible}
        onFooterToggle={onFooterToggle}
        countryChannels={countryChannels}
        onCountryChannelsChange={onCountryChannelsChange}
        labelsVisible={labelsVisible}
        onLabelsVisibleChange={() => setLabelsVisible(v => !v)}
        tr={tr}
      />
      <MapContainer {...mapConfig}>
        <MapViewSaver />
        <MapFlyToSetup flyToRef={flyToRef} />
        {DEBUG_ZOOM_LEVEL_ENABLED && <ZoomDebugUpdater zoomRef={zoomLabelRef} />}
        {/* country-polygons pane sits at z-index 200, below the marker pane at 400. */}
        <Pane name="country-polygons" style={{ zIndex: 200 }}>
          {/* This has the GeoJSON component. */}
          <Countries data={data} isEs={isEs} onCountryHover={COUNTRY_HOVER_LABEL_ENABLED ? handleCountryHover : undefined} />
        </Pane>

        {/* Creates the map-markers pane (z-index 400) before any markers are added. */}
        <MarkerPaneSetup />

        {/* ClusterGroupSetup must appear before the markers so its effect runs first. */}
        {clusteringEnabled && <ClusterGroupSetup clusterGroupRef={clusterGroupRef} processAllPointsRef={processAllPointsRef} />}
        {markers}

        {heatmapVisible && <HeatmapLayer data={data} visible={heatmapVisible} />}
      </MapContainer>
    </div>
  )
}

Map.propTypes = {
  category: PropTypes.string.isRequired,
  categoryName: PropTypes.string,
  restoreRegion: PropTypes.string,
  restoreChannelAlpha2: PropTypes.string,
  onChannelRestored: PropTypes.func,
  footerVisible: PropTypes.bool.isRequired,
  onFooterToggle: PropTypes.func.isRequired,
  countryChannels: PropTypes.number.isRequired,
  onCountryChannelsChange: PropTypes.func.isRequired,
};

export default memo(Map);

