import { useEffect } from 'react';

/**
 * Retries channel images that fail to load (YouTube CDN 429 rate limiting).
 * Uses event delegation since marker images live inside Leaflet DivIcons (not React-managed).
 * Failed images are queued and retried one at a time to avoid triggering rate limits again.
 *
 * Mount this hook once at the Map level. It attaches document-level error/load listeners
 * on mount and removes them on unmount — no arguments, no return value.
 */
export function useImageRetry() {
  useEffect(() => {
    const retryQueue = [];
    let retryTimer = null;

    const processQueue = () => {
      if (retryQueue.length === 0) {
        retryTimer = null;
        return;
      }
      const img = retryQueue.shift();
      const originalSrc = img.dataset.originalSrc;
      if (originalSrc && document.contains(img)) {
        img.src = originalSrc + (originalSrc.includes('?') ? '&' : '?') + 'retry=' + Date.now();
      }
      retryTimer = setTimeout(processQueue, 800);
    };

    const handleError = (e) => {
      if (e.target.tagName !== 'IMG' || !e.target.src.includes('ggpht.com')) return;
      const img = e.target;
      img.style.visibility = 'hidden';
      if (!img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src.split('?retry=')[0];
      }
      const retryCount = parseInt(img.dataset.retry || '0');
      if (retryCount < 5) { // max 5 retries per image
        img.dataset.retry = String(retryCount + 1);
        retryQueue.push(img);
        if (!retryTimer) {
          retryTimer = setTimeout(processQueue, 1500);
        }
      }
    };

    const handleLoad = (e) => {
      if (e.target.tagName !== 'IMG' || !e.target.src.includes('ggpht.com')) return;
      e.target.style.visibility = 'visible';
    };

    document.addEventListener('error', handleError, true);
    document.addEventListener('load', handleLoad, true);
    return () => {
      document.removeEventListener('error', handleError, true);
      document.removeEventListener('load', handleLoad, true);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);
}
