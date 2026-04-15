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
export const HEATMAP_ENABLED           = true;

// Adds a fullscreen button that expands the map to fill the entire viewport.
export const FULLSCREEN_ENABLED        = false;

// Replaces Leaflet's discrete zoom steps with smooth incremental scroll zoom.
export const SMOOTH_ZOOM_ENABLED       = false;

// Disables map fly animations and pin transitions when the OS/browser
// "prefers-reduced-motion" setting is active.
export const REDUCED_MOTION_ENABLED    = false;

// Shows the country flag emoji on each pin. Can be toggled at runtime via map settings.
export const FLAGS_VISIBLE           = true;

// Shows a small label at the bottom-right of the map with the current zoom level.
// Automatically true in development builds and false in production (via webpack NODE_ENV).
export const DEBUG_ZOOM_LEVEL_ENABLED  = process.env.NODE_ENV === 'development';

// ─── localStorage Keys ───────────────────────────────────────────────────────
// Single source of truth for every key written to localStorage.

export const STORAGE_KEY_MAP_VIEW = 'mapView';       // last map center + zoom
export const STORAGE_KEY_LANG     = 'isEs';          // UI language (true = Spanish)
export const STORAGE_KEY_THEME    = 'isDarkMode';    // colour theme (true = dark)
export const STORAGE_KEY_DIALOG   = 'isDialogOpen';  // category-picker dialog open state
export const STORAGE_KEY_CATEGORY = 'category';      // last selected category slug
export const STORAGE_KEY_SIDEBAR  = 'sidebarCountry'; // alpha-2 code of last open country sidebar
export const STORAGE_KEY_HEATMAP      = 'heatmapVisible';    // whether the heatmap overlay is on (true/false)
export const STORAGE_KEY_CLUSTERING   = 'clusteringEnabled'; // whether marker clustering is on (true/false)
export const STORAGE_KEY_FLAGS        = 'flagsVisible';       // whether pin flag emojis are shown (true/false)

// ─── Zoom Thresholds ─────────────────────────────────────────────────────────

export const ZOOM_VERY_LOW = 2; // below this: pins are at their smallest scale
export const ZOOM_LOW      = 3; // below this: scale pins down, hide flags
export const ZOOM_HIGH     = 5; // at this level: reveal channel name + view count directly on pins

// Shows the name of the country currently hovered on the map, in a small label at the bottom-right.
export const COUNTRY_HOVER_LABEL_ENABLED = true;
