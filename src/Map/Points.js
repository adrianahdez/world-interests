let mapWidth = 0; // width of the map
let mapHeight = 0; // height of the map
let scaleFactor = 0; // scale factor for the map

// Function to convert a character to hexadecimal value
function convertToHex(v) {
  v = v.toLowerCase().charCodeAt(0);
  v = (parseInt(255 / 28 * (v - 48) / 5));
  if (v > 128) v = 128;
  v = v.toString(16);
  if (v.length == 1) v = '0' + v;
  return v;
}

/**
 * Set up the point attributes based on the point statistics to change the appearance of the point on the map and give more relevance to the most important/popular points.
 */
function setUpPointAttributes(point, pointLatLon) {
  // Set up variables
  let name = point.channel.channelTitle;
  let value = getRandomFloat(0, 20); // TODO: Get value based on point statistics instead of random
  let score = getRandomFloat(-2, 2); // TODO: Get value based on point statistics instead of random

  // Set up the point attributes
  let attributes = null;
  var size = 0.2 + value / 8; // Calculate size based on value
  if (size > 1) size = 1;
  var opa = 0.5 + value / 8; // Calculate opacity based on value
  if (opa > 0.8) opa = 0.8;
  var color = 'fff'; // Default color

  // Determine text color based on score
  if (score < 0 && score >= -1) color = 'd90';
  else if (score < -1) color = 'a00';
  else if (score > 0 && score <= 1) color = '78dd73';
  else if (score > 1) color = '0d0';

  // Determine background color based on name value
  var bgColor = '#5962a1';
  if (typeof name[0] !== 'undefined') bgColor = convertToHex(name[0]);
  if (typeof name[1] !== 'undefined') bgColor += convertToHex(name[1]);
  else bgColor += 'cc';
  if (typeof name[2] !== 'undefined') bgColor += convertToHex(name[2]);
  else bgColor += 'cc';

  attributes = {
    size: size,
    opa: opa,
    color: color,
    bgColor: bgColor,
  };

  return attributes;
}

/**
 * Change the appearance of a point on the map
 * 
 * @param {Object} point
 * @param {Array} pointLatLon
 */
function changePointAppearance(point, pointLatLon) {
  let attrs = setUpPointAttributes(point, pointLatLon);

  let markerPoint = document.querySelector('.custom-marker__point[data-region="' + point.regionName + '"]');
  let bg = markerPoint.querySelector('.bg-color');
  let text = markerPoint.querySelector('.text-container');
  // text.style.color = '#' + attrs.color;
  bg.style.backgroundColor = '#' + attrs.bgColor;
  // markerPoint.style.opacity = attrs.opa;
}

// TODO: Remove this function when integrate with data stats.
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
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
  window.addEventListener('resize', resize(point, pointLatLon)); // Resize map on window resize
}