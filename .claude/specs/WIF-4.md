# Spec for Leaflet Feature Research And Recommendations

branch: docs/WIF-4-Leaflet-Feature-Research-And-Recommendations

## Summary

This document is a research and recommendation spec — not an implementation plan. Its purpose is to catalog the most valuable Leaflet 1.9, react-leaflet 4.2, and plugin-ecosystem features that could improve the World Interests map without overloading the interface. The app displays the #1 trending YouTube channel per country as custom markers on a global interactive map, with GeoJSON country polygons, category filtering, dark/light theme, and an info sidebar.

Each item below is evaluated for user benefit, implementation complexity, UX risks, and priority. Items are grouped by theme. No implementation decisions are made here — this spec feeds future `/spec` tickets.

---

## Map Interaction Improvements

### Gesture Handling — `leaflet-gesture-handling`
- **Benefit**: Prevents the scroll-trap problem where scrolling the page accidentally zooms the map. Requires Ctrl+scroll on desktop or two-finger pinch on mobile. Dramatically reduces user frustration on long pages.
- **Complexity**: Low
- **Plugin**: `leaflet-gesture-handling` (active, supports 52 languages)
- **UX risk**: Users may not discover the gesture requirement; the plugin shows an overlay hint automatically.

### Smooth Wheel Zoom — `@luomus/leaflet-smooth-wheel-zoom`
- **Benefit**: Replaces Leaflet's discrete zoom steps with smooth incremental zoom on mouse wheel, matching the feel of Google Maps.
- **Complexity**: Low
- **Plugin**: Multiple maintained forks available
- **UX risk**: May feel less predictable on trackpads; combine with zoom bounds to prevent drift.

### fitBounds with Sidebar Padding
- **Benefit**: When a marker or country is selected, the map automatically pans and zooms to center the relevant content while accounting for the open sidebar so nothing is hidden behind it.
- **Complexity**: Low
- **Native**: `map.fitBounds(bounds, { paddingBottomRight: [sidebarWidth, 0] })`
- **UX risk**: Over-zooming on closely packed countries; mitigate with `maxZoom` option.

### Locate Control — `leaflet.locatecontrol`
- **Benefit**: A "Find my region" button that uses the browser Geolocation API to pan the map to the user's country and highlight it. Useful for first-time visitors to immediately see their local trending content.
- **Complexity**: Low
- **Plugin**: `leaflet.locatecontrol` (actively maintained, domoritz)
- **UX risk**: Requires browser permission; desktop users may ignore it. Should be optional and non-intrusive.

---

## Visual Data Differentiation

### Marker Clustering — `leaflet.markercluster`
- **Benefit**: At low zoom levels (1–2), groups nearby markers into animated cluster badges showing the count. Clicking a cluster zooms into its members. Dramatically reduces visual noise when all ~200 country markers are visible simultaneously.
- **Complexity**: Medium
- **Plugin**: `leaflet.markercluster` (official Leaflet org, stable, 204k weekly downloads)
- **UX risk**: Cluster "explosion" when too many markers overlap at the minimum zoom; mitigate with `disableClusteringAtZoom` option and custom cluster icons that show category color.

### Heatmap Overlay — `@linkurious/leaflet-heat`
- **Benefit**: An optional overlay that visualizes regional trending intensity as a color gradient — useful for comparing which regions have the most popular content at a glance.
- **Complexity**: Medium
- **Plugin**: `@linkurious/leaflet-heat` (active fork of the official Leaflet.heat)
- **UX risk**: Heatmap can obscure individual markers and country polygon colors; must be a toggleable layer, not on by default.

### Pane Management (Z-index Layering)
- **Benefit**: Ensures GeoJSON country polygons always render below markers, and markers always render below popups/tooltips, preventing click-through failures and visual hierarchy confusion.
- **Complexity**: Low
- **Native**: `map.createPane()` / react-leaflet `<Pane>` component
- **UX risk**: None — purely structural.

---

## Performance and Scalability

### LayerGroup / FeatureGroup per Category
- **Benefit**: Wraps each category's markers in a `<LayerGroup>`, enabling instant show/hide toggling when the user changes category without re-rendering all markers or re-fetching data.
- **Complexity**: Low
- **Native**: react-leaflet `<LayerGroup>` component
- **UX risk**: None.

### Canvas Renderer for GeoJSON
- **Benefit**: Switches GeoJSON polygon rendering from SVG (default) to Canvas, significantly improving performance on lower-end devices and mobile when all 180+ country polygons are painted simultaneously.
- **Complexity**: Low
- **Native**: `L.canvas()` renderer option on GeoJSON layer
- **UX risk**: Canvas rendering does not support CSS transitions or per-feature styling as easily; hover/click detection is slightly less precise on very thin polygon borders.

### WebGL Renderer — `leaflet-glify` (future-scale)
- **Benefit**: If the app ever expands to show multiple channels per country or regional breakdowns (thousands of points), WebGL rendering handles millions of points in real time.
- **Complexity**: High
- **Plugin**: `leaflet-glify` (community-maintained)
- **UX risk**: No WebGL fallback for older devices or iOS Safari; requires feature detection. Not needed for current ~200 markers.

---

## Mobile vs Desktop UX

### Touch-Optimized Tap Targets
- **Benefit**: On mobile, the info sidebar currently opens only on marker tap. The small tap area of the custom marker (50×50px) can be difficult to hit accurately. Increasing the effective hit area (via CSS padding or a transparent overlay) reduces missed taps.
- **Complexity**: Low
- **UX risk**: Larger hit areas may overlap adjacent markers at low zoom; requires testing at zoom 1–2.

### Mobile-Only Bottom Sheet Sidebar
- **Benefit**: On narrow viewports the info sidebar could slide up from the bottom (native app pattern) rather than from the side, giving more vertical map space and matching mobile UX conventions.
- **Complexity**: Medium
- **UX risk**: Requires responsive breakpoint logic and separate animation paths for mobile vs desktop; increases component complexity.

### Minimap Context Widget — `leaflet-minimap`
- **Benefit**: A small thumbnail map in the corner showing the user's current view region in the context of the full world, helping with spatial orientation when zoomed into a specific region.
- **Complexity**: Medium
- **Plugin**: `leaflet-minimap` (stable, inactive but well-known)
- **UX risk**: Doubles rendered DOM nodes; performance impact on mobile with many markers. Should be desktop-only and hidden on narrow viewports.

---

## State Persistence

### Category Persistence in localStorage
- **Benefit**: Remembers the user's last selected category (Music, Gaming, etc.) across page reloads, so returning visitors don't always land on the default.
- **Complexity**: Low
- **UX risk**: Stale category if content is restructured; guard with validation against current category list.

### Sidebar Open/Scroll State Persistence
- **Benefit**: When the user reloads while the sidebar is open on a specific country, restoring that state means they don't lose their place.
- **Complexity**: Medium
- **UX risk**: The selected country's trending data may have changed since last visit; show a "data refreshed" indicator if so.

---

## Progressive Disclosure

### Zoom-Level Detail Tiers
- **Benefit**: At zoom 1–2, show only cluster badges or minimal markers. At zoom 3–4, show full markers with flags. At zoom 5, reveal the channel name and view count label on each marker without requiring hover. Each tier reveals more detail without overwhelming the initial view.
- **Complexity**: Medium
- **Native**: `zoomend` event + CSS classes per zoom tier (pattern established in WIF-6)
- **UX risk**: Rapid zoom changes could cause flickering if transitions are not debounced.

### Tooltip on Marker Hover (Desktop)
- **Benefit**: On desktop hover, show the channel name and country as a native Leaflet Tooltip (non-blocking, follows mouse) before the user commits to a click. Removes the need to click every marker to discover its content.
- **Complexity**: Low
- **Native**: `L.tooltip()` / react-leaflet `<Tooltip>` component
- **UX risk**: Tooltips on touch devices mimic popup behavior; must detect touch vs pointer to avoid duplicate UI.

### Country Highlight on GeoJSON Hover
- **Benefit**: When hovering a country polygon, visually highlight it (e.g., brightness or border color change) to confirm it is interactive and give feedback before click.
- **Complexity**: Low
- **Native**: `onEachFeature` mouseover/mouseout handlers already partially implemented
- **UX risk**: Highlight must not obscure the marker sitting on the country; manage with z-index panes.

---

## Accessibility (a11y) and Usability

### Keyboard Navigation for Markers
- **Benefit**: Allows keyboard-only users to Tab through markers and open the sidebar with Enter, meeting WCAG 2.1 AA requirements.
- **Complexity**: Medium
- **UX risk**: Leaflet DivIcon markers are not focusable by default; requires `tabindex="0"` and `keydown` handler on each marker element.

### ARIA Labels on Map Container and Markers
- **Benefit**: Screen readers announce the map and individual markers correctly. Each marker should have an `aria-label` with the country name and channel title.
- **Complexity**: Low
- **UX risk**: None; additive change only.

### Reduced Motion Respect
- **Benefit**: Users with vestibular disorders or motion sensitivity benefit from disabling map fly animations, marker transitions, and cluster animations when `prefers-reduced-motion: reduce` is set.
- **Complexity**: Low
- **Native**: CSS media query + conditional `animate: false` in Leaflet method calls
- **UX risk**: None; strictly an enhancement.

---

## Optional / Advanced Toggleable Features

### Fullscreen Mode — `leaflet.fullscreen`
- **Benefit**: A fullscreen button expands the map to fill the entire viewport, ideal for desktop exploration without page chrome. The sidebar would float as an overlay inside the fullscreen container.
- **Complexity**: Low
- **Plugin**: `leaflet.fullscreen` (official Leaflet org)
- **UX risk**: Sidebar layout must adapt to fullscreen container bounds; requires CSS adjustments.

### Dark Tile Layer Swap on Theme Toggle
- **Benefit**: Currently the map uses a single tile style regardless of theme. Switching to a dark-themed tile provider (e.g., CartoDB Dark Matter) when dark mode is active would make the map feel fully themed rather than mismatched.
- **Complexity**: Low
- **Native**: Swap `<TileLayer url>` prop on theme change
- **UX risk**: Brief tile loading gap on switch; mitigate with `keepBuffer` option. Requires evaluating tile provider terms.

### Country Comparison Mode (Future)
- **Benefit**: A toggle that lets users select two countries and compare their trending channels side by side in the sidebar — useful for users interested in regional content trends.
- **Complexity**: High
- **UX risk**: Sidebar layout must accommodate two panels; significant redesign. Post-MVP feature.

---

## Edge Case Handling

### No Data for Country
- **Benefit**: Some countries may return no trending data for the selected category. Currently markers simply don't appear; the country polygon gives no feedback. A subtle visual indicator (desaturated polygon, dashed border) could communicate "no data available here."
- **Complexity**: Low
- **UX risk**: May add visual noise; keep indicator very subtle.

### Slow Connection / API Timeout
- **Benefit**: A loading skeleton or spinner on the map canvas while data is fetching prevents the jarring "empty map" experience on slow connections. A retry button on timeout is more user-friendly than silent failure.
- **Complexity**: Low
- **UX risk**: Spinner must not block map interaction; overlay at low opacity or in a non-blocking corner position.

### Stale Data Indicator
- **Benefit**: If the API returns cached data older than N hours, a small badge or tooltip ("Updated 3h ago") informs users that the trends shown may not reflect the current moment.
- **Complexity**: Low
- **UX risk**: Requires the backend to return a `lastUpdated` timestamp in its response.

### Rate-Limited API (429 Handling)
- **Benefit**: The existing retry queue for channel images already handles 429s on image CDN requests. The same pattern should apply to the main API endpoint — with exponential backoff and a user-visible "retrying…" indicator.
- **Complexity**: Medium
- **UX risk**: Exponential backoff must cap at a reasonable maximum (e.g., 30 seconds) to avoid indefinite stale state.

---

## Functional Requirements

- This spec produces no code. It is a catalog of evaluated feature ideas for the World Interests map.
- Each idea must include: user benefit, implementation complexity, Leaflet/plugin source, and UX risk.
- Ideas must be actionable — specific enough to spawn a `/spec` ticket for implementation.
- No feature should require overloading the existing map interface; all intrusive features must be optional/toggleable.

## Possible Edge Cases

- Some plugins may have breaking changes with Leaflet 1.9 or react-leaflet 4.2; version compatibility must be verified before any implementation ticket is opened.
- Touch vs pointer detection must be handled separately for features that behave differently on mobile (tooltips, gesture handling, sidebar layout).

## Acceptance Criteria

- The spec file contains at least 15 distinct, evaluated feature ideas across all requested categories.
- Every idea includes complexity, benefit, and UX risk.
- No implementation code or file paths are included.
- The document is organized thematically and readable as a product backlog reference.

## Open Questions

None remaining — all resolved in Clarifications below.

## Testing Guidelines

No tests apply — this is a research and documentation spec. Verification is reading the document for completeness and accuracy.

## Clarifications

- **Tile layer**: Option A confirmed — keep GeoJSON polygons only, no external tile provider. The current CSS-variable background is the intended aesthetic.
- **Clustering now**: Yes, implement now. Must be togglable via a single constant in the central config file.
- **Country hover highlight (Task A)**: Confirmed already working — removed from backlog.
- **Marker hover tooltip (Task I)**: Confirmed already working via CSS `:hover` on `.custom-marker__container` — removed from backlog.
- **Task K (dark tiles)**: Removed — no tiles.
- **Toggle pattern**: Every feature that could be intrusive or experimental must have a single `const FEATURE_X = true/false` in the central config file to enable/disable it. The config file is the first thing to implement.
- **Gesture handling**: Wanted, must be toggleable via config.
- **No-data indicator**: Wanted, must be toggleable via config.
- **Marker clustering**: Middle priority, must be toggleable via config (one line).
- **Mobile bottom sheet**: Very low priority.
- **Heatmap**: Low priority, acknowledged as complex.
- **Sidebar state persistence**: Very high priority.
- **API retry**: Very high priority, but after simpler tasks.
- **Zoom detail tiers**: Highest priority (Priority 1), first in the roadmap.
- **Minimap**: Very low priority.
- **Smooth wheel zoom, reduced motion**: Lowest priority, uncertain value.

## Feature Priority Table

| # | Feature | Description | Complexity | Priority | Step |
|---|---------|-------------|------------|----------|------|
| 1 | **Central config file** | `src/config.js` with all feature flags and localStorage key constants | Low | Prerequisite | 1 |
| 2 | **Zoom detail tiers** | At zoom 5, reveal channel name and view count on markers directly (no hover needed) | Medium | Highest | 2 |
| 3 | **Debug zoom indicator** | Fixed label at bottom-right showing current zoom level; debug-only, off by default via `DEBUG_ZOOM_LEVEL_ENABLED` flag | Low | Debug | 3 |
| 4 | **Category persistence** | Remember last selected category (Music, Gaming…) across reloads | Low | High | 4 |
| 5 | **Sidebar state persistence** | Restore open country sidebar after reload | Medium | Very High | 5 |
| 6 | **Loading spinner** | Non-blocking overlay while data is fetching | Low | High | 6 |
| 7 | **Gesture handling** | Require Ctrl+scroll / two-finger pinch to zoom; prevents scroll trap | Low | Medium | 7 |
| 8 | **No-data country indicator** | Desaturated/dashed polygon style for countries with no data in current category | Low | Medium | 8 |
| 9 | **API retry with backoff** | Retry failed API calls (max 3, 2s/4s/8s delays) with subtle "retrying…" indicator | Medium | Very High | 9 |
| 10 | **Marker clustering** | Group nearby markers at low zoom into animated cluster badges | Medium | Middle | 10 |
| 11 | **ARIA labels** | `aria-label` on map container and each marker for screen readers | Low | Medium | 11 |
| 12 | **Keyboard navigation** | Tab through markers, open sidebar with Enter/Space | Medium | Medium | 12 |
| 13 | **Heatmap overlay** | Toggleable color-gradient layer showing regional trending intensity | Medium | Low | 13 |
| 14 | **Pane z-index layering** | Explicit Leaflet panes so polygons always render below markers | Low | Low | 14 |
| 15 | **Mobile bottom sheet** | Sidebar slides up from bottom on narrow viewports | Medium | Very Low | 15 |
| 16 | **Fullscreen mode** | Button to expand map to full viewport | Low | Low | 16 |
| 17 | **Minimap** | Small thumbnail map showing current view region in world context (desktop only) | Medium | Very Low | 17 |
| 18 | **Smooth wheel zoom** | Incremental scroll zoom replacing discrete Leaflet steps | Low | Lowest | 18 |
| 19 | **Reduced motion** | Disable animations when `prefers-reduced-motion: reduce` is set | Low | Lowest | 19 |



## Analysis

### Affected Files

**New files to create**
- `src/config.js` — central feature flags and app constants (localStorage keys, zoom thresholds, toggle booleans)

**Modified — Map layer**
- `src/Map/Map.jsx` — gesture handling, clustering wrapper, loading spinner, zoom tier class, API retry logic
- `src/Map/Points/Points.js` — zoom-level detail tier rendering
- `src/Map/geoJsonConfig.js` — no-data indicator styling
- `src/Map/Countries/Countries.jsx` — no-data polygon style, pane assignment

**Modified — App / state**
- `src/App/App.jsx` — category persistence, sidebar state persistence, API retry indicator
- `src/Common/LanguageContext.jsx` — no changes needed (pattern reference only)
- `src/Common/ThemeContext.jsx` — no changes needed (pattern reference only)

**Modified — Sidebar**
- `src/InfoSidebar/InfoSidebar.jsx` — sidebar state persistence (restore country on reload), mobile bottom sheet layout (low priority)
- `src/GlobalStyles/Components/_sidebars.scss` — mobile bottom sheet styles (low priority)

**Modified — Markers / accessibility**
- `src/CustomMarker/CustomMarker.jsx` — ARIA labels, keyboard navigation, zoom tier detail reveal
- `src/CustomMarker/CustomMarker.scss` — zoom tier CSS classes, reduced motion media query (low priority)

**New files (plugins, when needed)**
- Install `leaflet-gesture-handling`, `leaflet.markercluster` npm packages when those steps are reached

### Risks & Concerns

- **`leaflet.markercluster` + react-leaflet 4.2**: No official react-leaflet wrapper exists; must use `react-leaflet-cluster` (community wrapper) or integrate the raw Leaflet plugin inside a `useEffect`. Verify compatibility before implementing.
- **Gesture handling plugin**: Injects its own DOM overlay and event interceptors. May conflict with existing `scrollWheelZoom: true` setting in `mapConfig`; the two must be coordinated.
- **Sidebar state persistence**: The selected country's data changes every time the API is called. Restoring the open country requires re-fetching or confirming the data is still fresh; stale state must be handled gracefully.
- **Zoom detail tiers**: Extends the WIF-6 zoom-class pattern (`map--low-zoom`). Must not conflict with the existing `MapViewSaver` zoom class logic already in `Map.jsx`.
- **Category persistence**: The category list is fetched dynamically from the backend. A persisted slug that no longer exists in the current list must be silently discarded and replaced with the default.
- **No-data indicator**: `geoJsonConfig.js` currently applies a single style to all polygons. Differentiating "has data" vs "no data" requires access to the `data` object inside the GeoJSON style function, which currently receives only `feature`. Requires a factory function or closure pattern.

### Decisions

- **Central config first**: `src/config.js` is the prerequisite for every other feature. It must be implemented before any togglable feature.
- **Toggle pattern**: All togglable features check `import { FEATURE_X } from '../config'` and short-circuit when false. One-line change to disable.
- **No tiles**: GeoJSON-only map background is final. Not revisited unless city-level data is added.
- **Clustering wrapper**: A `const CLUSTERING_ENABLED` flag in config wraps markers in `<MarkerClusterGroup>` when true, bypasses it when false — zero other changes required.
- **localStorage keys**: All keys (`mapView`, `isEs`, `isDarkMode`, `isDialogOpen`, and new ones for category and sidebar state) are centralised as named constants in `config.js`.

## Implementation Workflow

Each step in this spec is implemented on its own Git branch following this pattern:

1. Start from `main` with `git pull`.
2. Create a branch named `feat/WIF-4-step<N>-<short-slug>` (e.g. `feat/WIF-4-step1-central-config`).
3. Implement the step, pause for user review.
4. On approval: commit with message `WIF-4: step N - <short description>`, mark the step `[x]` in this file, amend the commit to include the spec update, push the branch, and open a PR.
5. After PR is created, wait for user confirmation that the branch is merged to main and when confirmed, switch back to `main`, `git pull`, and start the next step.

**Code style note**: every new constant, flag, or non-obvious variable must have a brief inline or preceding comment explaining what it does.

## Implementation Plan

- [x] Step 1: Create `src/config.js` — define all feature flags (`CLUSTERING_ENABLED`, `GESTURE_HANDLING_ENABLED`, `NO_DATA_INDICATOR_ENABLED`, `HEATMAP_ENABLED`, `FULLSCREEN_ENABLED`, `SMOOTH_ZOOM_ENABLED`, `REDUCED_MOTION_ENABLED`) and all localStorage key constants (`STORAGE_KEY_MAP_VIEW`, `STORAGE_KEY_LANG`, `STORAGE_KEY_THEME`, `STORAGE_KEY_DIALOG`, `STORAGE_KEY_CATEGORY`, `STORAGE_KEY_SIDEBAR`); update existing files that hardcode these keys to import from config.
- [x] Step 2: Implement zoom detail tiers — extend the `MapViewSaver`/zoom-class pattern in `src/Map/Map.jsx` and `src/CustomMarker/CustomMarker.scss` to add a `map--max-zoom` class at zoom 5 that reveals channel name and view count labels directly on markers without hover.
- [x] Step 3: Add debug zoom level indicator — add a `DEBUG_ZOOM_LEVEL_ENABLED` flag to `src/config.js`; when enabled, render a small fixed label at the bottom-right corner of the map showing the current zoom level, updated on every `zoomend` event via `MapViewSaver`; hidden entirely when the flag is `false`.
- [x] Step 4: Implement category persistence — read last category from `STORAGE_KEY_CATEGORY` in `src/App/App.jsx` on mount (validate against current category list); write on every category change.
- [x] Step 5: Implement sidebar state persistence — store the open country's `alpha2` key under `STORAGE_KEY_SIDEBAR` in `src/App/App.jsx`; restore on mount by waiting for data to load then reopening the sidebar for that country.
- [x] Step 6: Add loading spinner — show a non-blocking overlay in `src/Map/Map.jsx` while `data` is empty and no error has occurred; hide once data arrives or error shows.
- [ ] Step 7: Add gesture handling — install `leaflet-gesture-handling`; integrate in `src/Map/Map.jsx` behind `GESTURE_HANDLING_ENABLED` flag from config; coordinate with existing `scrollWheelZoom` setting.
- [ ] Step 8: Add no-data country indicator — refactor `src/Map/geoJsonConfig.js` `setConfig` into a factory that receives the `data` object; apply desaturated/dashed style to countries with no data in the current category; guard behind `NO_DATA_INDICATOR_ENABLED` flag.
- [ ] Step 9: Implement API retry with exponential backoff — replace the current single `getData` call in `src/Map/Map.jsx` with a retry wrapper (max 3 retries, 2s/4s/8s delays, capped at 30s); show a subtle "retrying…" indicator in the map error overlay.
- [ ] Step 10: Add marker clustering — install `leaflet.markercluster` (or `react-leaflet-cluster`); wrap markers in `<MarkerClusterGroup>` in `src/Map/Map.jsx` behind `CLUSTERING_ENABLED` constant; style cluster icons to match the app theme.
- [ ] Step 11: Add ARIA labels — add `aria-label` to the map container in `src/Map/Map.jsx` and to each marker's DOM element in `src/CustomMarker/CustomMarker.jsx`; add `role="region"` to the map wrapper.
- [ ] Step 12: Add keyboard navigation for markers — add `tabIndex={0}` and `keydown` (Enter/Space) handler to each marker in `src/CustomMarker/CustomMarker.jsx` to open the sidebar.
- [ ] Step 13: Add heatmap overlay — install `@linkurious/leaflet-heat`; add a toggleable `<HeatmapLayer>` inside `<MapContainer>` in `src/Map/Map.jsx` driven by `HEATMAP_ENABLED` and a UI toggle button; guard behind config flag.
- [ ] Step 14: Add pane z-index layering — use react-leaflet `<Pane>` in `src/Map/Map.jsx` to explicitly assign GeoJSON polygons to a `polygons` pane (z-index 200) and markers to a `markers` pane (z-index 400).
- [ ] Step 15: Add mobile bottom sheet sidebar — add responsive CSS in `src/GlobalStyles/Components/_sidebars.scss` for viewports below 768px to position the sidebar as a bottom drawer; add slide-up animation.
- [ ] Step 16: Add fullscreen mode — install `leaflet.fullscreen`; add control to `src/Map/Map.jsx` behind `FULLSCREEN_ENABLED` flag; adapt sidebar CSS for fullscreen container bounds.
- [ ] Step 17: Add minimap — install `leaflet-minimap`; mount inside `<MapContainer>` in `src/Map/Map.jsx` on desktop only (hide below 768px viewport); guard behind config flag.
- [ ] Step 18: Add smooth wheel zoom — install `@luomus/leaflet-smooth-wheel-zoom`; integrate in `src/Map/Map.jsx` behind `SMOOTH_ZOOM_ENABLED` flag; disable default `scrollWheelZoom` when active.
- [ ] Step 19: Add reduced motion support — add `@media (prefers-reduced-motion: reduce)` rules to `src/CustomMarker/CustomMarker.scss` and `src/GlobalStyles/Components/_sidebars.scss`; pass `animate: false` to Leaflet `setView`/`flyTo` calls when the media query matches; guard behind `REDUCED_MOTION_ENABLED` flag.
