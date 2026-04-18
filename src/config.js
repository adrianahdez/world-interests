// ─── Feature Flags ───────────────────────────────────────────────────────────
// Set any flag to false to disable the feature entirely (one-line toggle).

// Groups nearby markers into animated cluster badges at low zoom levels.
export const CLUSTERING_ENABLED        = true;

// Requires Ctrl+scroll (desktop) or two-finger pinch (mobile) to zoom the map,
// preventing accidental zoom when the user is scrolling the page.
export const GESTURE_HANDLING_ENABLED  = false;

// Applies a desaturated / dashed polygon style to countries that have no data
// for the currently selected category.
export const NO_DATA_INDICATOR_ENABLED = true;

// Toggleable color-gradient overlay that visualises regional trending intensity.
export const HEATMAP_ENABLED           = false;

// Adds a fullscreen button that expands the map to fill the entire viewport.
export const FULLSCREEN_ENABLED        = false;

// Replaces Leaflet's discrete zoom steps with smooth incremental scroll zoom.
export const SMOOTH_ZOOM_ENABLED       = false;

// Shows the country flag emoji on each pin. Can be toggled at runtime via map settings.
export const FLAGS_VISIBLE           = true;

// Shows a small label at the bottom-right of the map with the current zoom level.
// Automatically true in development builds and false in production (via webpack NODE_ENV).
export const DEBUG_ZOOM_LEVEL_ENABLED  = process.env.NODE_ENV === 'development';

// Shows the labels overlay area (category badge, most-viewed, country hover). Can be toggled at runtime via map settings.
export const LABELS_VISIBLE = true;

// ─── localStorage Keys ───────────────────────────────────────────────────────
// Single source of truth for every key written to localStorage.

export const STORAGE_KEY_MAP_VIEW = 'mapView';       // last map center + zoom
export const STORAGE_KEY_LANG     = 'isEs';          // UI language (true = Spanish)
export const STORAGE_KEY_THEME    = 'isDarkMode';    // colour theme (true = dark)
export const STORAGE_KEY_CATEGORY_DIALOG   = 'isCategoryDialogOpen';  // category-picker dialog open state
export const STORAGE_KEY_SELECTED_CATEGORY = 'selectedCategory';      // last selected category slug
export const STORAGE_KEY_SIDEBAR  = 'sidebarCountry'; // alpha-2 code of last open country sidebar
export const STORAGE_KEY_HEATMAP           = 'heatmapVisible';    // whether the heatmap overlay is on (true/false)
export const STORAGE_KEY_CLUSTERING        = 'clusteringEnabled'; // whether marker clustering is on (true/false)
export const STORAGE_KEY_FLAGS             = 'flagsVisible';      // whether pin flag emojis are shown (true/false)
export const STORAGE_KEY_COUNTRY_CHANNELS  = 'countryChannels';   // how many historical channels to show in the country panel (1–10)
export const STORAGE_KEY_LABELS            = 'labelsVisible';     // whether the map overlay labels area is shown (true/false)

// ─── Country Panel ────────────────────────────────────────────────────────────

// Default number of top channels shown in the country history panel.
export const COUNTRY_CHANNELS_DEFAULT = 3;
// Maximum number of top channels the user can request in the country history panel.
export const COUNTRY_CHANNELS_MAX     = 10;

// ─── Marker Icon Geometry ─────────────────────────────────────────────────────
// DivIcon size and anchor used by CustomMarker. Anchor is bottom-centre so the
// pin tip sits exactly on the coordinate point.
export const MARKER_ICON_SIZE   = [50, 50]; // [width, height] in px
export const MARKER_ICON_ANCHOR = [25, 50]; // [x, y] — half-width, full-height

// ─── Pin Appearance Ranges ────────────────────────────────────────────────────
// Used in calculatePointAttributes() to scale opacity, brightness, and padding
// relative to a pin's normalised view count (0 = min, 1 = max in the dataset).

// Image padding (border ring thickness) range in px.
export const PIN_PADDING_MIN   = 1;  // px at minimum view count
export const PIN_PADDING_RANGE = 7;  // added px from min → max (1px → 8px)

// Background opacity range (0–1).
export const PIN_OPACITY_MIN   = 0.75; // fully legible floor
export const PIN_OPACITY_RANGE = 0.25; // added at max views (→ 1.0)

// CSS filter brightness range.
export const PIN_BRIGHTNESS_MIN   = 0.55; // dim at low view count
export const PIN_BRIGHTNESS_RANGE = 0.60; // added at max views (→ 1.15)

// ─── Zoom Thresholds ─────────────────────────────────────────────────────────

export const ZOOM_VERY_LOW = 2; // below this: pins are at their smallest scale
export const ZOOM_LOW      = 3; // below this: scale pins down, hide flags
export const ZOOM_HIGH     = 5; // at this level: reveal channel name + view count directly on pins

// Shows the name of the country currently hovered on the map, in a small label at the bottom-right.
export const COUNTRY_HOVER_LABEL_ENABLED = true;

// Max characters shown per field (channel name / video title) in the most-viewed label before truncating with '…'.
export const MOST_VIEWED_LABEL_TRUNCATE_LENGTH = 28;
