import { useCountryRanking } from './useCountryRanking';

/**
 * Fetches trending-#1 history for a country + category.
 * Calls GET /api/country/history?country=<alpha2>&category=<slug>&limit=<n>&mode=<videos|channels>.
 *
 * Thin wrapper over useCountryRanking — see it for the returned shape and semantics.
 * `data` carries `videos` (mode=videos) or `channels` (mode=channels).
 *
 * @param {string|null} alpha2        ISO 3166-1 alpha-2 country code, e.g. 'ES'
 * @param {string}      category      Category slug, e.g. 'music'
 * @param {number}      limit         Number of items to request
 * @param {string}      [mode='videos']   Historical view: 'videos' or 'channels'
 * @param {number}      [retryTrigger=0]  Increment to force a re-fetch (retry button)
 */
export function useCountryHistory(alpha2, category, limit, mode = 'videos', retryTrigger = 0) {
  const url = (alpha2 && category)
    ? process.env.REACT_APP_BACKEND_API_URL +
      'api/country/history?country=' + encodeURIComponent(alpha2) +
      '&category=' + encodeURIComponent(category) +
      '&limit=' + encodeURIComponent(limit) +
      '&mode=' + encodeURIComponent(mode)
    : null;

  return useCountryRanking(url, retryTrigger, 'useCountryHistory');
}
