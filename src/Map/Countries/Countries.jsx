// ./countries-and-us-states.geo.json is a file that contains the coordinates of the countries and US states. Not used at the moment.
import countries from './countries.geo.json';
import React, { useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { getCountryLatLon, getAlpha2FromAlpha3 } from '../Points/Data';
import { setConfig } from '../geoJsonConfig';

const Countries = ({ data, category }) => {
  const map = useMap();
  const dataRef = useRef(data);

  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

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

    map.setView(latLon, map.getZoom(), { animate: true });
    // TODO: Add code to show the sidebar with the country data
  };

  // Configure click event for each country
  const onEachCountry = (feature, layer) => {
    const countryName = feature.properties.name;
    const alpha2 = getAlpha2FromAlpha3(feature.id);

    if (countryName && alpha2) {
      layer.on({
        click: (event) => handleCountryClick(event, countryName, alpha2)
      });
    } else {
      layer.on({
        click: () => console.log(`No se pudo obtener el nombre y/o alpha2 de ${feature.id}`)
      });
    }
  };

  return (
    <GeoJSON data={countries} style={setConfig} onEachFeature={onEachCountry} />
  );
};

export default Countries;