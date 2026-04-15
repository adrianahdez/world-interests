import React, { useState, useEffect, useRef } from 'react';
import './MapSettings.scss';

// Floating settings panel anchored to the bottom-left of the map.
// Currently exposes the heatmap toggle; add more items to the panel as new features arrive.
function MapSettings({ heatmapVisible, onHeatmapToggle, clusteringEnabled, onClusteringToggle, fullscreenEnabled, onFullscreenToggle, flagsVisible, onFlagsToggle, tr }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close the panel when the user clicks outside of it.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  return (
    <div className={`map-settings${open ? ' map-settings--open' : ''}`} ref={panelRef}>
      {open && (
        <div className="map-settings__panel" role="menu">
          <p className="map-settings__title">{tr.settingsLabel}</p>
          <div className="map-settings__item" role="menuitem">
            <span className="map-settings__item-label">{tr.clusteringLabel}</span>
            <label className="map-settings__toggle" aria-label={tr.clusteringLabel}>
              <input type="checkbox" checked={clusteringEnabled} onChange={onClusteringToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </label>
          </div>
          <div className="map-settings__item" role="menuitem">
            <span className="map-settings__item-label">{tr.fullscreenLabel}</span>
            <label className="map-settings__toggle" aria-label={tr.fullscreenLabel}>
              <input type="checkbox" checked={fullscreenEnabled} onChange={onFullscreenToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </label>
          </div>
          <div className="map-settings__item" role="menuitem">
            <span className="map-settings__item-label">{tr.flagsLabel}</span>
            <label className="map-settings__toggle" aria-label={tr.flagsLabel}>
              <input type="checkbox" checked={flagsVisible} onChange={onFlagsToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </label>
          </div>
          <div className="map-settings__item" role="menuitem">
            <span className="map-settings__item-label">{tr.heatmapLabel}</span>
            <label className="map-settings__toggle" aria-label={tr.heatmapLabel}>
              <input
                type="checkbox"
                checked={heatmapVisible}
                onChange={onHeatmapToggle}
              />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </label>
          </div>
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
