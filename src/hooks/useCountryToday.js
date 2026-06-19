import { useCountryRanking } from './useCountryRanking';

/**
 * Fetches the latest real-time (today) top-N ranking for a country + category.
 * Calls GET /api/country/today?country=<alpha2>&category=<slug>&limit=<n>.
 *
 * Thin wrapper over useCountryRanking — see it for the returned shape and semantics.
 *
 * @param {string|null} alpha2        ISO 3166-1 alpha-2 country code, e.g. 'ES'
 * @param {string}      category      Category slug, e.g. 'music'
 * @param {number}      limit         Number of channels to request (1–20)
 * @param {number}      [retryTrigger=0]  Increment to force a re-fetch (retry button)
 */
export function useCountryToday(alpha2, category, limit, retryTrigger = 0) {
  const url = (alpha2 && category)
    ? process.env.REACT_APP_BACKEND_API_URL +
      'api/country/today?country=' + encodeURIComponent(alpha2) +
      '&category=' + encodeURIComponent(category) +
      '&limit=' + encodeURIComponent(limit)
    : null;

  return useCountryRanking(url, retryTrigger, 'useCountryToday');
}
