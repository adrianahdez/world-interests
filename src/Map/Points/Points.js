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

/**
 * Set up the point attributes based on the channel name to give each channel a consistent colour.
 */
function setUpPointAttributes(point) {
  let name = point.channel.channelTitle;

  // Determine background color based on name value (first 3 characters) so the same channel name always gets the same color.
  var bgColor = '#5962a1';
  if (typeof name[0] !== 'undefined') bgColor = convertToHex(name[0], 0);
  if (typeof name[1] !== 'undefined') bgColor += convertToHex(name[1], 1);
  else bgColor += 'cc';
  if (typeof name[2] !== 'undefined') bgColor += convertToHex(name[2], 2);
  else bgColor += 'cc';

  return { bgColor };
}

/**
 * Change the appearance of a point on the map
 *
 * @param {Object} point
 * @param {Array} pointLatLon
 */
function changePointAppearance(point, pointLatLon) {
  if (typeof point === 'undefined') return;

  let attrs = setUpPointAttributes(point);

  let markerPoint = document.querySelector('.custom-marker__point[data-region="' + point.regionName + '"]');
  let bg = markerPoint.querySelectorAll('.bg-color');
  for (let i = 0; i < bg.length; i++) {
    bg[i].style.backgroundColor = '#' + attrs.bgColor;
  }
}

/**
 * Reload values based on window resize and set up the points appearance
 *
 * @param {Object} point
 * @param {Array} pointLatLon
 */
const resize = (point, pointLatLon) => {
  mapWidth = document.getElementById('app').clientWidth; // Get map width
  mapHeight = document.getElementById('app').clientHeight; // Get map height
  if (mapWidth > mapHeight) scaleFactor = mapWidth / 360; // Set scale factor
  else scaleFactor = mapHeight / 360;

  changePointAppearance(point, pointLatLon);
}

export const processPoint = (point, pointLatLon) => {
  // Initial setup
  resize(point, pointLatLon); // Call resize to set up the map
  window.addEventListener('resize', resize(point, pointLatLon), { passive: true }); // Resize map on window resize
}
