/**
 * JSON with the center coordinates of each country in format: ISO 3166-1 alpha-2 and alpha-3 codes, because we need to match the data from the API which comes with alpha-2 codes, with a point on the map of each country.
 */
import countryCoordinates from '../Countries/country-codes-lat-long-flags-alpha3.json';

/**
 * Utility function to fetch data from an endpoint.
 * @param {string} url Endpoint to fetch data from.
 * @returns {Promise} Promise object represents the data fetched from the API.
 */
export const fetchData = async (url) => {
  const response = await fetch(url,
    {
      headers: {
        'Content-type': 'application/json',
      },
    }
  );
  const data = await response?.json();
  return data;
}

/**
 * Get data from the json file to display map points.
 * The json file is updated periodically with new data from the backend.
 * @returns {Promise} Promise object represents the data fetched from the API.
 */
export const getData = async (category) => {
  const apiUrl = process.env.REACT_APP_BACKEND_API_URL + 'get-json.php' + '?category=' + category;
  try {
    const response = await fetchData(apiUrl);
    if (!response.data || response.error) {
      throw new Error('No data');
    }
    return response.data;
  } catch (e) {
    return [];
  }
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