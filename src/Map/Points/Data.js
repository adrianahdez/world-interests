/**
 * JSON with the center coordinates of each country in format: ISO 3166-1 alpha-2 and alpha-3 codes, because we need to match the data from the API which comes with alpha-2 codes, with a point on the map of each country.
 */
import countryCoordinates from '../Countries/country-codes-lat-long-flags-alpha3.json';

/**
 * Utility function to fetch data from an endpoint.
 * @param {string} url Endpoint to fetch data from.
 * @returns {Promise} Promise object represents the data fetched from the API.
 */
const fetchData = async (url) => {
  const response = await fetch(url,
    {
      // no-store bypasses the browser HTTP cache so switching categories always
      // fetches fresh data from the server, regardless of cache-control headers.
      cache: 'no-store',
      headers: {
        'Content-type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with HTTP ${response.status} (${response.statusText}).`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`Request to ${url} returned a non-JSON response. The backend may not have data available yet.`);
  }
}

/**
 * Get data from the json file to display map points.
 * The json file is updated periodically with new data from the backend.
 * @returns {Promise} Promise object represents the data fetched from the API.
 */
export const getData = async (apiUrl) => {
  const response = await fetchData(apiUrl);
  if (!response || response.error) {
    throw new Error(response?.data || 'No data returned from backend.');
  }
  return response.data;
}

/**
 * Find the center coordinates of a country based on its alpha-2 code.
 * @param {string} alpha2 - ISO 3166-1 alpha-2 code of the country received from the API.
 * @returns {Array<number>} - [latitude, longitude]
 */
export const getCountryLatLon = (alpha2) => {
  const c = countryCoordinates.find(c => c.alpha2 === alpha2);
  return c ? [c.latitude, c.longitude] : null;
}

/**
 * Get the ISO 3166-1 alpha-2 code of an alpha-3 code.
 * @param {string} alpha3 - ISO 3166-1 alpha-3 code of the country.
 */
export const getAlpha2FromAlpha3 = (alpha3) => {
  const c = countryCoordinates.find(c => c.alpha3 === alpha3);
  const alpha2 = c ? c.alpha2 : null;
  return alpha2;
}

/**
 * Get the flag of a country based on its alpha-2 code.
 * @param {string} alpha2 - ISO 3166-1 alpha-2 code of the country.
 */
export const getFlagFromAlpha2 = (alpha2) => {
  const c = countryCoordinates.find(c => c.alpha2 === alpha2);
  const flag = c ? c.flag : null;
  return flag;
}