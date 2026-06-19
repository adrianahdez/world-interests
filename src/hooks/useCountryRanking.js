import { useState, useEffect, useLayoutEffect } from 'react';

/**
 * Shared fetch state machine for the country-panel ranking endpoints
 * (`/api/country/today` and `/api/country/history`). Both return the same envelope
 * shape and only differ by URL, so the fetch/abort/501/empty/error logic lives here.
 *
 * Returns:
 *   data       — response `data` object on success; null otherwise.
 *   isLoading  — true while the request is in flight.
 *   isEmpty    — true when the endpoint returned no items or a 501 stub response.
 *   error      — true on a genuine network or server error (not 501).
 *
 * Cancels any in-flight request when `url` or `retryTrigger` changes, or on unmount.
 * Treats HTTP 501 as an empty/coming-soon state (not an error) so the panel shows a
 * neutral "no data yet" message. The empty check covers both payload keys
 * (`channels` for today, `videos`/`channels` for history).
 *
 * @param {string|null} url           Full request URL, or null when params are incomplete (skips fetch).
 * @param {number}      retryTrigger  Increment to force a re-fetch (retry button).
 * @param {string}      label         Source name for the console warning on failure.
 */
export function useCountryRanking(url, retryTrigger, label) {
  const [data, setData]           = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty]     = useState(false);
  const [error, setError]         = useState(false);

  // Reset state synchronously before browser paint whenever the target URL
  // changes. useLayoutEffect fires after DOM mutations but before paint, so
  // stale data from the previous mode/country is never visible for even one frame.
  useLayoutEffect(() => {
    setData(null);
    setIsLoading(!!url);
    setIsEmpty(false);
    setError(false);
  }, [url, retryTrigger]);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();

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

        // Payload key depends on the endpoint/mode: `videos` or `channels`.
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
        console.warn(`[WorldInterests] ${label} fetch failed:`, err.message);
        setError(true);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [url, retryTrigger, label]);

  return { data, isLoading, isEmpty, error };
}
