/**
 * JSON with the center coordinates of each country in format: ISO 3166-1 alpha-2 and alpha-3 codes, because we need to match the data from the API which comes with alpha-2 codes, with a point on the map of each country.
 */
import countryCoordinates from './country-codes-lat-long-alpha3.json';

/**
 * Utility function to fetch data from an endpoint.
 * @param {string} url Endpoint to fetch data from.
 * @returns {Promise} Promise object represents the data fetched from the API.
 */
const fetchData = async (url) => {
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
export const getData = async () => {
  // This commented line provokes an error in console: https://... has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
  const apiUrl = process.env.REACT_APP_BACKEND_API_URL + 'response.json';
  // That's why we use PHP to get the JSON file from the backend.
  // const apiUrl = process.env.REACT_APP_BACKEND_API_URL + 'getJson.php';
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
