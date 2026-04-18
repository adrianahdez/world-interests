// ─── Settings Visibility Flags ───────────────────────────────────────────────
// Controls which options appear in the map settings menu.
// Set a flag to false to hide that option from the UI entirely.
// The underlying feature default (in config.js) still applies — only the
// user's ability to toggle the option is removed.
// All flags default to true (all options visible).

// Shows/hides the "Clustering" toggle in the settings menu.
// When false, clustering behaves according to CLUSTERING_ENABLED in config.js
// and the user cannot change it at runtime.
export const SETTING_CLUSTERING_ENABLED = true;

// Shows/hides the "Fullscreen" toggle in the settings menu.
// When false, fullscreen behaves according to FULLSCREEN_ENABLED in config.js
// and the user cannot change it at runtime.
export const SETTING_FULLSCREEN_ENABLED = true;

// Shows/hides the "Flags" toggle in the settings menu.
// When false, flag visibility behaves according to FLAGS_VISIBLE in config.js
// and the user cannot change it at runtime.
export const SETTING_FLAGS_ENABLED = true;

// Shows/hides the "Footer" toggle in the settings menu.
// When false, the footer is shown or hidden based on its own default
// and the user cannot change it at runtime.
export const SETTING_FOOTER_ENABLED = true;

// Shows/hides the "Heatmap" toggle in the settings menu.
// When false, the heatmap behaves according to HEATMAP_ENABLED in config.js
// and the user cannot change it at runtime.
export const SETTING_HEATMAP_ENABLED = true;

// Shows/hides the "Labels" toggle in the settings menu.
// When false, label visibility behaves according to LABELS_VISIBLE in config.js
// and the user cannot change it at runtime.
export const SETTING_LABELS_ENABLED = true;

// Shows/hides the "Country Channels" stepper in the settings menu.
// When false, the channel count is fixed at COUNTRY_CHANNELS_DEFAULT in config.js
// and the user cannot change it at runtime.
export const SETTING_COUNTRY_CHANNELS_ENABLED = true;
