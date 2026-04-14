let mapWidth = 0; // width of the map
let mapHeight = 0; // height of the map
let scaleFactor = 0; // scale factor for the map

// Function to convert a character to hexadecimal value
function convertToHex(v, index) {
  v = v.toLowerCase().charCodeAt(0);
  v = (parseInt(255 / 28 * (v - 48) / 5) + index * 50) % 256;
  v = v.toString(16);
  if (v.length == 1) v = '0' + v;
  return v;
}

// Convert a 6-char hex string to an rgba() CSS value with the given opacity.
function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Set up the point attributes based on channel name (colour) and viewCount stats (border + opacity).
 *
 * @param {Object} point
 * @param {number} minViews  Minimum viewCount across all visible pins in the current dataset.
 * @param {number} maxViews  Maximum viewCount across all visible pins in the current dataset.
 */
function setUpPointAttributes(point, minViews, maxViews) {
  let name = point.channel.channelTitle;

  // Determine background color based on name value (first 3 characters) so the same channel name always gets the same color.
  var bgColor = '5962a1';
  if (typeof name[0] !== 'undefined') bgColor = convertToHex(name[0], 0);
  if (typeof name[1] !== 'undefined') bgColor += convertToHex(name[1], 1);
  else bgColor += 'cc';
  if (typeof name[2] !== 'undefined') bgColor += convertToHex(name[2], 2);
  else bgColor += 'cc';

  // Normalize viewCount to 0–1 relative to the current dataset.
  // Falls back to fully prominent (1) if min/max are not yet available or all pins are equal.
  const viewCount = Number(point.statistics?.viewCount) || 0;
  const hasRange = typeof minViews === 'number' && typeof maxViews === 'number';
  const range = hasRange ? maxViews - minViews : 0;
  const normalized = (hasRange && range > 0) ? (viewCount - minViews) / range : 1;

  // More views → more padding (thicker visible border ring) + more opaque background.
  const imagePadding = Math.round(1 + normalized * 7); // 1px (low) → 8px (high)
  const bgOpacity = 0.65 + normalized * 0.35;          // 0.65 (low) → 1.0 (high)

  return { bgColor, bgOpacity, imagePadding };
}

/**
 * Change the appearance of a point on the map
 *
 * @param {Object} point
 * @param {Array} pointLatLon
 * @param {number} minViews
 * @param {number} maxViews
 */
function changePointAppearance(point, pointLatLon, minViews, maxViews) {
  if (typeof point === 'undefined') return;

  let attrs = setUpPointAttributes(point, minViews, maxViews);

  let markerPoint = document.querySelector('.custom-marker__point[data-region="' + point.regionName + '"]');
  if (!markerPoint) return;

  let bg = markerPoint.querySelectorAll('.bg-color');
  for (let i = 0; i < bg.length; i++) {
    bg[i].style.backgroundColor = hexToRgba(attrs.bgColor, attrs.bgOpacity);
  }

  markerPoint.style.padding = attrs.imagePadding + 'px';
}

/**
 * Reload values based on window resize and set up the points appearance
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

export const processPoint = (point, pointLatLon, minViews, maxViews) => {
  // Initial setup
  resize(point, pointLatLon, minViews, maxViews); // Call resize to set up the map
  window.addEventListener('resize', () => resize(point, pointLatLon, minViews, maxViews), { passive: true }); // Resize map on window resize
}
