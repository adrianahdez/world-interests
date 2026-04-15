// ./countries-and-us-states.geo.json is a file that contains the coordinates of the countries and US states. Not used at the moment.
import countries from './countries.geo.json';
import React, { useRef, useEffect, useContext } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { getCountryLatLon, getAlpha2FromAlpha3 } from '../Points/Data';
import { makeStyleConfig } from '../geoJsonConfig';
import { MapPointContext } from '../../Common/MapPointContext';

// Style applied to the GeoJSON sub-layer for the currently selected country.
// Weight/color are set inline; the class adds the CSS filter for the fill highlight.
const SELECTED_STYLE = { weight: 2.5, color: 'var(--country-delimiter-color)', opacity: 1, className: 'country--selected' };

const Countries = ({ data, onCountryHover = null }) => {
  const map = useMap();
  const dataRef = useRef(data);
  // Holds the mounted Leaflet GeoJSON layer so we can call setStyle() instead of remounting.
  const geoJsonLayerRef = useRef(null);

  const { mapPoint } = useContext(MapPointContext);
  // Derived from the globally selected map point; null when no country is selected.
  const selectedAlpha2 = mapPoint?.alpha2 ?? null;

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Recompute style function when data changes.
  // Using useMemo so it's only recalculated when data reference changes.
  const styleFunc = React.useMemo(() => makeStyleConfig(data), [data]);

  // Apply updated styles to the existing layer instead of remounting via key.
  // Remounting forces Leaflet to re-process the entire GeoJSON geometry on every
  // category switch — setStyle() only updates fill/stroke properties.
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(styleFunc);
    }
  }, [styleFunc]);

  // Highlight the selected country polygon; reset all others to their base style.
  // Runs after the style reset above (declared later = runs later in same render).
  useEffect(() => {
    const layer = geoJsonLayerRef.current;
    if (!layer) return;
    layer.eachLayer((subLayer) => {
      const alpha2 = getAlpha2FromAlpha3(subLayer.feature?.id);
      if (alpha2 && alpha2 === selectedAlpha2) {
        subLayer.setStyle(SELECTED_STYLE);
      } else {
        subLayer.setStyle(styleFunc(subLayer.feature));
      }
    });
  }, [selectedAlpha2, styleFunc]);

  const handleCountryClick = (event, countryName, alpha2) => {
    const latLon = getCountryLatLon(alpha2);
    if (!latLon) {
      console.error('No se pudo obtener latLon para alpha2:', alpha2);
      return;
    }
    const countryData = dataRef.current[alpha2];
    if (!countryData) {
      console.log('No data for:', countryName);
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.setView(latLon, map.getZoom(), { animate: !prefersReduced });
    // TODO: Add code to show the sidebar with the country data
  };

  // Configure click event for each country
  const onEachCountry = (feature, layer) => {
    const countryName = feature.properties.name;
    const alpha2 = getAlpha2FromAlpha3(feature.id);

    if (countryName && alpha2) {
      layer.on({
        click: (event) => handleCountryClick(event, countryName, alpha2),
        mouseover: () => onCountryHover?.(countryName),
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

export default Countries;
