import { getAlpha2FromAlpha3 } from './Points/Data';
import { NO_DATA_INDICATOR_ENABLED } from '../config';

const BASE_STYLE = {
  weight: 1.3,
  color: 'var(--country-delimiter-color)',
  opacity: 1,
  fillColor: 'var(--country-fill-color)',
  fillOpacity: 1,
  dashArray: '3',
};

const NO_DATA_STYLE = {
  weight: 1,
  color: 'var(--country-delimiter-color)',
  opacity: 0.5,
  fillColor: 'var(--country-fill-color)',
  fillOpacity: 1,
  dashArray: '5 5',
  className: 'country--no-data',
};

/**
 * Returns a Leaflet GeoJSON style function.
 * When NO_DATA_INDICATOR_ENABLED is true and data is loaded, countries with
 * no entry in the current category receive a desaturated/dashed style.
 */
export function makeStyleConfig(data) {
  const hasLoadedData = Object.keys(data).length > 0;

  return function styleConfig(feature) {
    if (NO_DATA_INDICATOR_ENABLED && hasLoadedData) {
      const alpha2 = getAlpha2FromAlpha3(feature.id);
      if (!alpha2 || !data[alpha2]) {
        return NO_DATA_STYLE;
      }
    }
    return BASE_STYLE;
  };
}
