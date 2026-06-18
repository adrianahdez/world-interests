import { useState, useEffect } from 'react';

/**
 * Fetches historical top-channel data for a given country + category combination.
 *
 * Calls GET /api/country/history?country=<alpha2>&category=<slug>&limit=<n>&mode=<videos|channels>
 *
 * Returns:
 *   data       — { days, latest_capture_at, country_name_*, videos|channels } on success; null otherwise.
 *   isLoading  — true while the request is in flight.
 *   isEmpty    — true when the endpoint returned no items or a 501 stub response.
 *   error      — true on a genuine network or server error (not 501).
 *
 * Cancels any in-flight request when alpha2, category, limit, or mode changes, or on unmount.
 * Treats HTTP 501 as an empty/coming-soon state rather than an error so the panel shows
 * a neutral "no data yet" message instead of a red error indicator.
 *
 * @param {string|null} alpha2        ISO 3166-1 alpha-2 country code, e.g. 'ES'
 * @param {string}      category      Category slug, e.g. 'music'
 * @param {number}      limit         Number of items to request
 * @param {string}      [mode='videos']   Historical view: 'videos' or 'channels'
 * @param {number}      [retryTrigger=0]  Increment to force a re-fetch (used by retry button)
 */
export function useCountryHistory(alpha2, category, limit, mode = 'videos', retryTrigger = 0) {
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty]   = useState(false);
  const [error, setError]       = useState(false);

  useEffect(() => {
    // Don't fetch until we have all required params.
    if (!alpha2 || !category) {
      setData(null);
      setIsLoading(false);
      setIsEmpty(false);
      setError(false);
      return;
    }

    const controller = new AbortController();

    setData(null);
    setIsLoading(true);
    setIsEmpty(false);
    setError(false);

    const url =
      process.env.REACT_APP_BACKEND_API_URL +
      'api/country/history?country=' + encodeURIComponent(alpha2) +
      '&category=' + encodeURIComponent(category) +
      '&limit=' + encodeURIComponent(limit) +
      '&mode=' + encodeURIComponent(mode);

    fetch(url, {
      signal: controller.signal,
      headers: { 'Content-type': 'application/json' },
    })
      .then(async (res) => {
        // 501 = endpoint not yet implemented — treat as empty, not an error.
        if (res.status === 501) {
          setIsEmpty(true);
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }

        const json = await res.json();

        // The payload key depends on mode: `videos` or `channels`.
        const items = json?.data?.videos || json?.data?.channels || [];
        if (json.error || !json.data || items.length === 0) {
          setIsEmpty(true);
          setIsLoading(false);
          return;
        }

        setData(json.data);
        setIsLoading(false);
      })
      .catch((err) => {
        // Ignore cancellation — it's intentional, not a failure.
        if (err.name === 'AbortError') return;
        console.warn('[WorldInterests] useCountryHistory fetch failed:', err.message);
        setError(true);
        setIsLoading(false);
      });

    return () => controller.abort();
  // retryTrigger is intentionally in the dep array — incrementing it re-runs the fetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alpha2, category, limit, mode, retryTrigger]);

  return { data, isLoading, isEmpty, error };
}
