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

- Should clustering be implemented before or after a potential data-volume increase (i.e., is 200 markers enough to justify it now)?
- Is a dark tile provider (CartoDB, Stadia) acceptable under their terms for a public app with no API key?
- Should the minimap be desktop-only from day one, or start hidden on all platforms and be user-toggleable?

## Testing Guidelines

No tests apply — this is a research and documentation spec. Verification is reading the document for completeness and accuracy.
