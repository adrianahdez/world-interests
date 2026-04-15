import React, { useState, useEffect, useRef } from 'react';
import './MapSettings.scss';

// Floating settings panel anchored to the bottom-left of the map.
// Currently exposes the heatmap toggle; add more items to the panel as new features arrive.
function MapSettings({ heatmapVisible, onHeatmapToggle, clusteringEnabled, onClusteringToggle, fullscreenEnabled, onFullscreenToggle, flagsVisible, onFlagsToggle, footerVisible, onFooterToggle, tr }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close the panel when the user clicks outside of it or presses Escape.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`map-settings${open ? ' map-settings--open' : ''}`} ref={panelRef}>
      {open && (
        <div className="map-settings__panel" role="region" aria-label={tr.settingsLabel}>
          <p className="map-settings__title">{tr.settingsLabel}</p>
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.clusteringLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={clusteringEnabled} onChange={onClusteringToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.fullscreenLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={fullscreenEnabled} onChange={onFullscreenToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.flagsLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={flagsVisible} onChange={onFlagsToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.footerLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={footerVisible} onChange={onFooterToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.heatmapLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={heatmapVisible} onChange={onHeatmapToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
        </div>
      )}
      <button
        className="map-settings__trigger"
        onClick={() => setOpen(v => !v)}
        aria-label={tr.settingsLabel}
        aria-expanded={open}
        title={tr.settingsLabel}
      >
        ⚙
      </button>
    </div>
  );
}

export default MapSettings;
