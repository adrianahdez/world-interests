// ./countries-and-us-states.geo.json is a file that contains the coordinates of the countries and US states. Not used at the moment.
import countries from './countries.geo.json';
import React, { useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { GeoJSON, useMap } from 'react-leaflet';
import { getCountryLatLon, getAlpha2FromAlpha3, getFlagFromAlpha2 } from '../Points/Data';
import { makeStyleConfig } from '../geoJsonConfig';
import { MapPointContext } from '../../Common/MapPointContext';
import { CountryPanelContext } from '../../Common/CountryPanelContext';

// Style applied to the GeoJSON sub-layer for the currently selected country.
// Weight/color are set inline; the class adds the CSS filter for the fill highlight.
const SELECTED_STYLE = { weight: 2.5, color: 'var(--country-delimiter-color)', opacity: 1, className: 'country--selected' };

const Countries = ({ data, isEs = false, onCountryHover = null }) => {
  const map = useMap();
  const dataRef = useRef(data);
  // Hover handlers are bound once in onEachCountry; read current language via ref so
  // toggling the language mid-session localizes the next hover without rebinding listeners.
  const isEsRef = useRef(isEs);
  // Holds the mounted Leaflet GeoJSON layer so we can call setStyle() instead of remounting.
  const geoJsonLayerRef = useRef(null);

  const { selectedAlpha2 } = useContext(MapPointContext);
  const { openCountryPanel, isCountryPanelOpen, selectedCountry, setSelectedCountry } = useContext(CountryPanelContext);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    isEsRef.current = isEs;
  }, [isEs]);

  // When the panel opens via a ?country= URL param on page load, selectedCountry has an
  // empty countryName and flag because the GeoJSON hasn't been queried yet. Scan the static
  // countries GeoJSON to fill in the name and flag as soon as this component mounts.
  useEffect(() => {
    if (!isCountryPanelOpen || !selectedCountry?.alpha2 || selectedCountry.countryName) return;
    const target = selectedCountry.alpha2;
    for (const feature of countries.features) {
      const alpha2 = getAlpha2FromAlpha3(feature.id);
      if (alpha2 === target) {
        setSelectedCountry(prev => ({
          ...prev,
          countryName: feature.properties.name || target,
          flag: getFlagFromAlpha2(target) ?? '',
        }));
        break;
      }
    }
  }, [isCountryPanelOpen, selectedCountry?.alpha2, selectedCountry?.countryName, setSelectedCountry]);

  // Recompute style function when data changes.
  // Using useMemo so it's only recalculated when data reference changes.
  const styleFunc = React.useMemo(() => makeStyleConfig(data), [data]);

  // Apply updated styles to the existing layer instead of remounting via key.
  // Remounting forces Leaflet to re-process the entire GeoJSON geometry on every
  // category switch. setStyle() only updates fill/stroke — className is NOT propagated
  // to existing paths, so we update classList manually after each setStyle() call.
  useEffect(() => {
    const layer = geoJsonLayerRef.current;
    if (!layer) return;
    layer.eachLayer((subLayer) => {
      const style = styleFunc(subLayer.feature);
      subLayer.setStyle(style);
      if (subLayer._path) {
        subLayer._path.classList.toggle('country--no-data', style.className === 'country--no-data');
        subLayer._path.classList.remove('country--selected');
      }
    });
  }, [styleFunc]);

  // Highlight the selected country polygon; reset all others to their base style.
  // Runs after the style reset above (declared later = runs later in same render).
  // className is not propagated by setStyle(), so classList is updated manually.
  useEffect(() => {
    const layer = geoJsonLayerRef.current;
    if (!layer) return;
    layer.eachLayer((subLayer) => {
      const alpha2 = getAlpha2FromAlpha3(subLayer.feature?.id);
      const isSelected = alpha2 && alpha2 === selectedAlpha2;
      if (isSelected) {
        subLayer.setStyle(SELECTED_STYLE);
        subLayer._path?.classList.add('country--selected');
        subLayer._path?.classList.remove('country--no-data');
      } else {
        const style = styleFunc(subLayer.feature);
        subLayer.setStyle(style);
        if (subLayer._path) {
          subLayer._path.classList.toggle('country--no-data', style.className === 'country--no-data');
          subLayer._path.classList.remove('country--selected');
        }
      }
    });
  }, [selectedAlpha2, styleFunc]);

  const handleCountryClick = (event, countryName, alpha2) => {
    const latLon = getCountryLatLon(alpha2);
    if (!latLon) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.setView(latLon, map.getZoom(), { animate: !prefersReduced });
    // openCountryPanel sets selectedAlpha2 and handles sidebar mutual exclusion.
    openCountryPanel(alpha2, countryName, getFlagFromAlpha2(alpha2) ?? '');
  };

  // Configure click event for each country
  const onEachCountry = (feature, layer) => {
    const countryName = feature.properties.name;
    const alpha2 = getAlpha2FromAlpha3(feature.id);

    if (countryName && alpha2) {
      layer.on({
        click: (event) => handleCountryClick(event, countryName, alpha2),
        mouseover: () => {
          const regionName = dataRef.current?.[alpha2]?.[0]?.regionName;
          const esName = typeof regionName === 'object' ? regionName?.es : null;
          const label = (isEsRef.current && esName) ? esName : countryName;
          onCountryHover?.(label);
        },
        mouseout: () => onCountryHover?.(null),
      });
    } else {
      layer.on({
        click: () => console.log(`No se pudo obtener el nombre y/o alpha2 de ${feature.id}`)
      });
    }
  };

  return (
    <GeoJSON
      ref={geoJsonLayerRef}
      data={countries}
      style={styleFunc}
      onEachFeature={onEachCountry}
    />
  );
};

Countries.propTypes = {
  data: PropTypes.object.isRequired,
  isEs: PropTypes.bool,
  onCountryHover: PropTypes.func,
};

export default Countries;
