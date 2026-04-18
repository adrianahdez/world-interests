import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './MapSettings.scss';
import { COUNTRY_CHANNELS_MAX } from '../../config';
import {
  SETTING_CLUSTERING_VISIBLE,
  SETTING_FULLSCREEN_VISIBLE,
  SETTING_FLAGS_VISIBLE,
  SETTING_FOOTER_VISIBLE,
  SETTING_HEATMAP_VISIBLE,
  SETTING_LABELS_VISIBLE,
  SETTING_COUNTRY_CHANNELS_VISIBLE,
} from '../../settingsVisibility';

// Floating settings panel anchored to the bottom-left of the map.
// Currently exposes the heatmap toggle; add more items to the panel as new features arrive.
function MapSettings({ heatmapVisible, onHeatmapToggle, clusteringEnabled, onClusteringToggle, fullscreenEnabled, onFullscreenToggle, flagsVisible, onFlagsToggle, footerVisible, onFooterToggle, countryChannels, onCountryChannelsChange, labelsVisible, onLabelsVisibleChange, tr }) {
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
          {SETTING_CLUSTERING_VISIBLE && (
          <label className="map-settings__item">
            <span className="map-settings__item-label">
              {tr.clusteringLabel}
              {/* Small pin icon gives users visual context that this controls map pins */}
              <svg className="map-settings__pin-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={clusteringEnabled} onChange={onClusteringToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          )}
          {SETTING_FULLSCREEN_VISIBLE && (
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.fullscreenLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={fullscreenEnabled} onChange={onFullscreenToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          )}
          {SETTING_FLAGS_VISIBLE && (
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.flagsLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={flagsVisible} onChange={onFlagsToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          )}
          {SETTING_FOOTER_VISIBLE && (
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.footerLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={footerVisible} onChange={onFooterToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          )}
          {SETTING_HEATMAP_VISIBLE && (
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.heatmapLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={heatmapVisible} onChange={onHeatmapToggle} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          )}
          {SETTING_LABELS_VISIBLE && (
          <label className="map-settings__item">
            <span className="map-settings__item-label">{tr.labelsLabel}</span>
            <span className="map-settings__toggle">
              <input type="checkbox" checked={labelsVisible} onChange={onLabelsVisibleChange} />
              <span className="map-settings__toggle-track">
                <span className="map-settings__toggle-thumb" />
              </span>
            </span>
          </label>
          )}
          {SETTING_COUNTRY_CHANNELS_VISIBLE && (
          <div className="map-settings__item">
            <span className="map-settings__item-label">{tr.countryChannelsLabel}</span>
            {/* +/- stepper is faster and more touch-friendly than a select on mobile */}
            <div className="map-settings__stepper">
              <button
                type="button"
                className="map-settings__stepper-btn"
                onClick={() => onCountryChannelsChange(countryChannels - 1)}
                disabled={countryChannels <= 1}
                aria-label="Decrease"
              >−</button>
              <span className="map-settings__stepper-value">{countryChannels}</span>
              <button
                type="button"
                className="map-settings__stepper-btn"
                onClick={() => onCountryChannelsChange(countryChannels + 1)}
                disabled={countryChannels >= COUNTRY_CHANNELS_MAX}
                aria-label="Increase"
              >+</button>
            </div>
          </div>
          )}
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

MapSettings.propTypes = {
  heatmapVisible: PropTypes.bool.isRequired,
  onHeatmapToggle: PropTypes.func.isRequired,
  clusteringEnabled: PropTypes.bool.isRequired,
  onClusteringToggle: PropTypes.func.isRequired,
  fullscreenEnabled: PropTypes.bool.isRequired,
  onFullscreenToggle: PropTypes.func.isRequired,
  flagsVisible: PropTypes.bool.isRequired,
  onFlagsToggle: PropTypes.func.isRequired,
  footerVisible: PropTypes.bool.isRequired,
  onFooterToggle: PropTypes.func.isRequired,
  countryChannels: PropTypes.number.isRequired,
  onCountryChannelsChange: PropTypes.func.isRequired,
  labelsVisible: PropTypes.bool.isRequired,
  onLabelsVisibleChange: PropTypes.func.isRequired,
  tr: PropTypes.object.isRequired,
};

export default MapSettings;
