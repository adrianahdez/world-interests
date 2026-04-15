let mapWidth = 0; // width of the map
let mapHeight = 0; // height of the map
let scaleFactor = 0; // scale factor for the map

// Curated palette of visually distinct colours for pin backgrounds.
// Each channel name is hashed to a consistent index so the same name always gets the same colour.
const COLOR_PALETTE = [
  'e74c3c', // red
  'e67e22', // orange
  'f1c40f', // yellow
  '2ecc71', // emerald
  '1abc9c', // turquoise
  '3498db', // blue
  '9b59b6', // purple
  'e91e63', // pink
  '00bcd4', // cyan
  'ff5722', // deep orange
  '8bc34a', // lime green
  '5c6bc0', // indigo
  'f06292', // light pink
  '26c6da', // light cyan
  'ffa726', // amber
  '66bb6a', // light green
  'ab47bc', // medium purple
  'ef5350', // light red
  '42a5f5', // light blue
  '26a69a', // teal
];

// Deterministic hash: maps a channel name to a consistent palette index.
function nameToColorIndex(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % COLOR_PALETTE.length;
}

// Convert a 6-char hex string to an rgba() CSS value with the given opacity.
function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Pure function — computes pin appearance attributes from channel stats.
 * Returns { bgColor, bgOpacity, imagePadding, bgBrightness } with no side effects.
 *
 * @param {Object} point
 * @param {number} minViews  Minimum viewCount across all visible pins in the current dataset.
 * @param {number} maxViews  Maximum viewCount across all visible pins in the current dataset.
 */
export function calculatePointAttributes(point, minViews, maxViews) {
  let name = point.channel.channelTitle;

  // Pick a colour from the palette deterministically based on the full channel name.
  // Same name always maps to the same colour; different names spread across the palette.
  const bgColor = COLOR_PALETTE[nameToColorIndex(name)] || '5962a1';

  // Normalize viewCount to 0–1 relative to the current dataset.
  // Falls back to fully prominent (1) if min/max are not yet available or all pins are equal.
  const viewCount = Number(point.statistics?.viewCount) || 0;
  const hasRange = typeof minViews === 'number' && typeof maxViews === 'number';
  const range = hasRange ? maxViews - minViews : 0;
  const normalized = (hasRange && range > 0) ? (viewCount - minViews) / range : 1;

  // More views → more padding (thicker visible border ring) + more opaque + brighter ("shining").
  const curved = Math.pow(normalized, 0.5);             // square root curve — shifts midpoint up toward higher values
  const imagePadding = Math.round(1 + curved * 7);     // 1px (low) → 8px (high)
  const bgOpacity = 0.75 + curved * 0.25;              // 0.75 (low) → 1.0 (high), square root curve — floor high enough for readable text
  const bgBrightness = 0.55 + normalized * 0.60;       // 0.55 (low) → 1.15 (high, slight shine)

  return { bgColor, bgOpacity, imagePadding, bgBrightness };
}

/**
 * Apply visual attributes to the DOM element for a given point.
 * Looks up the marker element by iterating querySelectorAll to avoid
 * string interpolation in the selector (guards against special chars in regionName).
 *
 * @param {Object} point
 * @param {Array} pointLatLon
 * @param {number} minViews
 * @param {number} maxViews
 */
function changePointAppearance(point, pointLatLon, minViews, maxViews) {
  if (typeof point === 'undefined') return;

  let attrs = calculatePointAttributes(point, minViews, maxViews);

  // Find the marker element without string interpolation — safe against regionName containing quotes.
  const allPoints = document.querySelectorAll('.custom-marker__point');
  let markerPoint = null;
  for (let i = 0; i < allPoints.length; i++) {
    if (allPoints[i].dataset.region === point.regionName) {
      markerPoint = allPoints[i];
      break;
    }
  }
  if (!markerPoint) return;

  let bg = markerPoint.querySelectorAll('.bg-color');
  for (let i = 0; i < bg.length; i++) {
    bg[i].style.backgroundColor = hexToRgba(attrs.bgColor, attrs.bgOpacity);
  }

  markerPoint.style.padding = attrs.imagePadding + 'px';
  markerPoint.style.setProperty('--pin-brightness', attrs.bgBrightness);
}

/**
 * Reload values based on window size and apply point appearance.
 * Called on initial load and from the debounced resize handler in Map.jsx.
 *
 * @param {Object} point
 * @param {Array} pointLatLon
 * @param {number} minViews
 * @param {number} maxViews
 */
const resize = (point, pointLatLon, minViews, maxViews) => {
  mapWidth = document.getElementById('app').clientWidth; // Get map width
  mapHeight = document.getElementById('app').clientHeight; // Get map height
  if (mapWidth > mapHeight) scaleFactor = mapWidth / 360; // Set scale factor
  else scaleFactor = mapHeight / 360;

  changePointAppearance(point, pointLatLon, minViews, maxViews);
}

/**
 * Apply initial appearance for a single point.
 * The window resize listener is NOT registered here — it is registered once
 * in Map.jsx's processAllPoints effect and debounced to prevent the per-point
 * listener memory leak that accumulated on every category switch.
 *
 * @param {Object} point
 * @param {Array} pointLatLon
 * @param {number} minViews
 * @param {number} maxViews
 */
export const processPoint = (point, pointLatLon, minViews, maxViews) => {
  resize(point, pointLatLon, minViews, maxViews);
}
