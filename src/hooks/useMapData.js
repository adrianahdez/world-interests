import { useState, useEffect, useRef } from 'react';
import { getData } from '../Map/Points/Data';

// Exponential backoff delays between fetch retries: 2s, 4s, 8s (max 3 retries).
const RETRY_DELAYS = [2000, 4000, 8000];

/**
 * Fetches map data for the given category with automatic retry on failure.
 * Cancels any in-flight request or pending retry when category changes or the
 * component using this hook unmounts.
 *
 * @param {string} category  Category slug (e.g. 'music', 'gaming').
 * @returns {{ data: Object, isLoading: boolean, mapError: boolean, retryCount: number }}
 */
export function useMapData(category) {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // Tracks the previous result to skip re-renders when the data hasn't changed.
  const prevDataRef = useRef({});

  useEffect(() => {
    // setIsLoading(true) fires synchronously at the top of this effect, which React
    // schedules as a passive effect (after paint). This means there is a ~1-frame gap
    // on category switch where old markers are still visible before the overlay appears —
    // intentional: showing stale content is better UX than a blank map flash.
    // On initial mount isLoading starts as true (above), so the overlay is immediate.
    setMapError(false);
    setIsLoading(true);
    setRetryCount(0);

    let cancelled = false;
    let retryTimer = null;

    const attempt = (attemptIndex) => {
      const apiUrl = process.env.REACT_APP_BACKEND_API_URL + 'get-json.php?category=' + category;
      getData(apiUrl)
        .then((result) => {
          if (cancelled) return;
          setRetryCount(0);
          // Only update state when data actually changed to avoid unnecessary re-renders.
          if (JSON.stringify(result) !== JSON.stringify(prevDataRef.current)) {
            prevDataRef.current = result;
            setData(result);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          if (cancelled) return;
          if (attemptIndex < RETRY_DELAYS.length) {
            // Schedule next retry and surface the attempt counter in the UI.
            setRetryCount(attemptIndex + 1);
            retryTimer = setTimeout(() => attempt(attemptIndex + 1), RETRY_DELAYS[attemptIndex]);
          } else {
            // All retries exhausted — surface the error.
            console.warn(
              '[WorldInterests] Could not load map data for category "' + category +
              '" after ' + (RETRY_DELAYS.length + 1) + ' attempts:',
              error.message
            );
            setRetryCount(0);
            setMapError(true);
            setIsLoading(false);
            setData({});
          }
        });
    };

    attempt(0);

    return () => {
      // Cancel in-flight retries when category changes or component unmounts.
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [category]);

  return { data, isLoading, mapError, retryCount };
}
