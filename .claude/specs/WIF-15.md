# Spec for Most-Viewed-Label-And-Mobile-Labels-Optimization

branch: feature/WIF-15-Most-Viewed-Label-And-Mobile-Labels-Optimization

## Summary

Add a "Most Viewed" label to the existing labels area that shows the most viewed channel and/or video today from the current category worldwide. Clicking this label should open the InfoSidebar for the corresponding map pin and center the map on it — consistent with how clicking a country polygon currently works.

Additionally, optimize the labels area for mobile: labels should be arranged side by side when space allows (without overlapping the settings icon), falling back to vertical stacking when they don't fit. Finally, add a user-togglable setting to hide/show the labels area entirely, enabled by default (i.e., visible by default), with the default controlled by a constant in the config file.

## Functional Requirements

- A new label is displayed in the labels area showing the most viewed channel and/or video today for the currently selected category, across all countries.
- The most viewed label updates when the user changes the category.
- Clicking the most viewed label opens the InfoSidebar for the corresponding map pin (the same pin that would be opened by clicking that country's marker on the map).
- Clicking the most viewed label also centers the map on the corresponding pin, matching the behavior triggered when clicking a country polygon.
- On mobile viewports, labels are laid out side by side (flex row) as long as they do not overlap the settings icon; when they no longer fit side by side, they stack vertically.
- A new toggle setting exists to hide or show the labels area.
- The default visibility state of the labels area is controlled by a constant in the config file.
- The default value of that constant makes the labels area visible by default.
- The hide/show setting is accessible from the existing settings panel.

## Possible Edge Cases

- The current category has no data yet (loading state) — the most viewed label should show a loading or empty state and not be clickable.
- Multiple countries tie for the most viewed position — pick deterministically (e.g., first in the API response order).
- The most viewed pin's country has no corresponding marker rendered on the map yet — clicking the label should still open the sidebar and center the map without error.
- The labels area is hidden via the setting — the most viewed label must also be hidden and not accessible.
- On very narrow mobile screens, even a single label may not fit beside the settings icon — ensure graceful fallback to vertical stacking.
- Category changes while the sidebar is already open for a different pin — the sidebar should update or close cleanly.

## Acceptance Criteria

- A "Most Viewed" label appears in the labels area and reflects data for the current category.
- Clicking the label opens the InfoSidebar and centers the map on the correct country marker.
- Clicking the label while the sidebar is already open for a different country switches to the new country.
- On mobile, labels are side by side when space allows and stack vertically when not.
- Labels never overlap the settings icon on any screen size.
- The settings panel includes a toggle to show/hide the labels area.
- The config file contains a constant for the default visibility of the labels area.
- Hiding the labels area via the setting removes it from view entirely (not just collapsed).
- The most viewed label resets/updates when the category is changed.

## Open Questions

- Should the most viewed label show the channel name, the video title, or both? The ticket says "channel and/or video" — which is preferred, and is there a character limit or truncation rule?
- Is "most viewed" determined by a single field already present in the existing API response (e.g., a view count field), or does it require a new backend endpoint or additional data?
- Should the label link to the YouTube channel/video externally (open in new tab) in addition to opening the map pin sidebar, or only open the sidebar?
- Should the hide-labels setting persist across sessions (localStorage), or reset on each page load?
- Is there a design reference or existing label style to follow for the new "Most Viewed" label, or should it match the current label appearance exactly?

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- Clicking the most viewed label triggers the correct sidebar open and map center actions.
- Most viewed label updates when the selected category changes.
- Labels area is hidden when the setting is toggled off.
- Mobile layout uses flex row when labels fit, and falls back to column stacking when they don't.

## Clarifications

- **Q1 (Label content)**: Show both channel name and video title, each truncated to `MOST_VIEWED_LABEL_TRUNCATE_LENGTH` characters with `…` if needed. Prefix with a trophy emoji (🏆). Format: `🏆 <channelTitle> · <videoTitle>` (both truncated independently).
- **Q2 (External link)**: Only open the InfoSidebar and center the map. No external YouTube navigation.
- **Q3 (Persistence)**: The hide/show labels setting persists via localStorage.
- **TD1 (Mobile layout)**: CSS flex-wrap approach — `flex-direction: row; flex-wrap: wrap` on mobile, with `padding-right` on the container to reserve space for the settings button.
- **TD2 (Visual style)**: Trophy emoji prefix only; the label otherwise uses the same class and styling as existing labels.

## Analysis

### Affected Files

**Config**
- `src/config.js` — Add `LABELS_VISIBLE` (default `true`), `STORAGE_KEY_LABELS`, and `MOST_VIEWED_LABEL_TRUNCATE_LENGTH`

**Map component (core logic)**
- `src/Map/Map.jsx` — Add `labelsVisible` state (localStorage-backed), `useEffect` to persist it, derive `mostViewedPoint` from `mapPoints`, render the Most Viewed label, wire click handler (`setMapPoint` + `toggleSidebar` + `map.setView`), conditionally render the entire labels area, pass `labelsVisible` and setter to `MapSettings`

**Settings panel**
- `src/Map/MapSettings/MapSettings.jsx` — Add a labels-visibility toggle following the exact existing checkbox pattern; accept two new props (`labelsVisible`, `onLabelsVisibleChange`)

**Styles**
- `src/Map/Countries/Countries.scss` — Add mobile responsive rules for `.map-overlay-labels`: `flex-direction: row`, `flex-wrap: wrap`, and a `padding-right` that clears the settings button; add cursor/hover style for the new clickable label

### Risks & Concerns

- **`viewCount` type**: The API may return `viewCount` as a string. Must parse to integer before comparing. Map.jsx already does this in the normalization block (lines 202–206) — follow the same pattern.
- **Empty `mapPoints`**: On initial load or category change before data arrives, `mapPoints` will be empty/null. The most viewed label must not render or crash.
- **Map instance access**: Labels are rendered inside `MapContainer` in Map.jsx. The Leaflet map instance is accessible via `useMapEvents` (already used in Map.jsx) — the same `map` ref used elsewhere in the component can be reused for `map.setView`.
- **Settings button overlap**: The settings button is positioned `bottom-right`. On mobile, the labels area must have enough `padding-right` to never visually overlap it. The button is 40×40px on mobile — the padding must account for this plus a gap.
- **`prefers-reduced-motion`**: The `map.setView` call must pass `{ animate: !prefersReduced }` consistent with how `Countries.jsx` does it.
- **No test suite**: This repo has no configured tests. Testing is manual via the dev server.

### Decisions

- **Most viewed derivation**: Reduce `mapPoints` array (which holds the first pin per country) to find the entry with the highest `parseInt(statistics.viewCount, 10)`. Ties broken by array order (first occurrence wins).
- **Label click wires into existing sidebar/map-point flow**: Reuse `setMapPoint` (from `MapPointContext`) and `toggleSidebar` (from `SidebarContext`) exactly as `CustomMarker.jsx` does — no new state or context needed.
- **Config constant drives default**: `labelsVisible` state initializes from `localStorage.getItem(STORAGE_KEY_LABELS)` with fallback to `LABELS_VISIBLE` from config — same pattern as `heatmapVisible`.

## Implementation Plan

- [x] Step 1: Add constants to `src/config.js` — `LABELS_VISIBLE = true`, `STORAGE_KEY_LABELS = 'labelsVisible'`, and `MOST_VIEWED_LABEL_TRUNCATE_LENGTH = 28`, each with a brief inline comment.
- [ ] Step 2: Wire `labelsVisible` state into `src/Map/Map.jsx` — add useState (localStorage-backed via `LABELS_VISIBLE` fallback), add useEffect to persist on change, and pass `labelsVisible` + `onLabelsVisibleChange` as props to `<MapSettings>`.
- [ ] Step 3: Add the labels-visibility toggle to `src/Map/MapSettings/MapSettings.jsx` — follow the existing checkbox pattern exactly, consuming the two new props.
- [ ] Step 4: Add the Most Viewed label to `src/Map/Map.jsx` — derive `mostViewedPoint` from `mapPoints` (max `viewCount`), render the `🏆` label with truncated channel + video title, wire the click handler (`setMapPoint` + `toggleSidebar(true)` + `map.setView` with `prefers-reduced-motion` check), and wrap the entire labels area in a `labelsVisible` guard.
- [ ] Step 5: Update `src/Map/Countries/Countries.scss` — add mobile flex-row layout for `.map-overlay-labels` (using `respond-max(768)` mixin) with `flex-wrap: wrap` and `padding-right` to clear the settings button; add `cursor: pointer` and a hover style for the clickable most-viewed label variant.
