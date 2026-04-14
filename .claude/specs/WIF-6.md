# Spec for Resolve Project TODOs

branch: chore/WIF-6-Resolve-Project-TODOs

## Summary

There are four TODO comments spread across the codebase. This spec tracks the investigation and resolution of each one. Two are dead code left over from an unfinished feature (random stat values and a helper function that exists only to support them). One is a missing UX behaviour: clicking a country polygon on the map centres the view but does not open the info sidebar. The fourth is a comment on the `Map` component about improving the default mobile centre — which was resolved by WIF-5 (persisted map position) and is no longer needed.

---

### TODO A — `Points.js:20-21`: Random `value` and `score`

```
let value = getRandomFloat(0, 20); // TODO: Get value based on point statistics...
let score = getRandomFloat(-2, 2); // TODO: Get value based on point statistics...
```

**What the author intended:** Eventually drive marker size, opacity, and text colour from real YouTube engagement statistics (views, likes, etc.) returned by the backend. The random floats were a placeholder.

**Current state:** The lines that apply `size`, `opa`, and `color` are all **commented out** in `changePointAppearance`. Only `bgColor` is applied, and it is derived from the channel name — it does not depend on `value` or `score` at all. The random values are computed but never used.

**Recommendation:** Delete the two TODO lines, the dead computation blocks that depend on them (`size`, `opa`, `color`), and the `getRandomFloat` helper (TODO C below). If engagement-based styling is ever wanted, it should be designed fresh with real API data — there is no point maintaining placeholder code that does nothing.

---

### TODO B — `Countries.jsx:29`: Show sidebar on country click

```
map.setView(latLon, map.getZoom(), { animate: true });
// TODO: Add code to show the sidebar with the country data
```

**What the author intended:** Clicking a country polygon should not only pan the map to that country but also open the info sidebar showing that country's trending data — the same sidebar that opens when a marker is clicked.

**Current state:** The pan works. The sidebar call is missing. `Countries` only receives `data` and `category` as props; it does not receive `toggleSidebar` or `setMapPoint`, so it currently has no way to open the sidebar. Both callbacks are available in `Map.jsx` and already flow down from `App`.

**Recommendation:** This is worth implementing — it is a real UX gap. When a user clicks a country boundary rather than a marker, they expect to see the same info panel. The fix is small: pass `toggleSidebar` and `setMapPoint` from `Map` into `Countries`, then call them inside `handleCountryClick` after `map.setView`.

---

### TODO C — `Points.js:76`: Remove `getRandomFloat` when stats are integrated

```
// TODO: Remove this function when integrate with data stats.
function getRandomFloat(min, max) { ... }
```

**What the author intended:** This helper exists only to feed the random placeholders in TODO A. Once real stats replace those, the function becomes dead code.

**Recommendation:** Remove together with TODO A. No dependency on this function exists outside of `Points.js`.

---

### TODO D — `Map.jsx` (now removed): "Center map in a better way in mobile"

This comment (`// TODO: Center map in a better way in mobile.`) was present in the original `Map.jsx` but was removed as part of the WIF-5 implementation (the linter/formatter cleaned the file). WIF-5 resolved the underlying problem by persisting the map position across reloads, so this TODO is already resolved and requires no action.

---

## Functional Requirements

- Clicking a country polygon opens the info sidebar with that country's data, in addition to panning the map (TODO B).
- `Countries` receives `toggleSidebar` and `setMapPoint` as props and calls them on a successful country click.
- The random `value` and `score` variables and all code that depends on them are removed from `Points.js` (TODO A).
- The `getRandomFloat` helper function is removed from `Points.js` (TODO C).
- The `changePointAppearance` function retains only the code that is actually used (bgColor assignment); commented-out dead lines are removed.

## Possible Edge Cases

- **Country clicked with no data**: `handleCountryClick` already guards against this (`if (!countryData) return`). The sidebar must not be opened when there is no data for the clicked country.
- **`countryData` shape**: The sidebar expects a single point object (`mapPoint`), not an array. `countryData` in `Countries` is the array `data[alpha2]`; the first element `[0]` must be passed to `setMapPoint`, consistent with how `Map.jsx` uses `data[alpha2][0]` for markers.
- **Removing random stats code**: `size` and `opa` are computed but already commented out. Removing them is safe as long as `bgColor` logic (which is independent) is preserved intact.

## Acceptance Criteria

- Clicking a country polygon pans the map **and** opens the info sidebar showing that country's data.
- Clicking a country with no data in the current category does nothing (no sidebar, no error).
- `Points.js` contains no `getRandomFloat` calls or definition, no random `value`/`score` variables, and no commented-out `size`/`opa`/`color` application lines.
- No console errors are introduced.

## Open Questions

None remaining — all resolved in Clarifications below.

## Testing Guidelines

No tests are configured in this project (see CLAUDE.md). Manual verification:

- Click a country polygon that has data → sidebar opens with correct country info.
- Click a country polygon that has no data → sidebar does not open, no console errors.
- Verify `Points.js` no longer references `getRandomFloat`.
- Verify marker colours still render correctly after the cleanup.
- At zoom < 3: pins are smaller and flags are hidden.
- At zoom ≥ 3: pins are full size and flags are visible.
- Pins with higher viewCount have a thicker, more vivid border; pins with lower viewCount have a thinner, more faded border.

## Clarifications

- **TODO B zoom on click**: Keep zoom unchanged (`map.getZoom()`). Pan only, no zoom change.
- **TODO A/C dead code scope**: Remove all commented-out lines inside `changePointAppearance` (`text.style.color`, `markerPoint.style.opacity`) along with `value`, `score`, `size`, `opa`, `color` variables and `getRandomFloat`. Replace with real stat-based logic.
- **Stats differentiation — direction**: More `viewCount` → thicker border (more padding on image container) + more opaque background. Less `viewCount` → thinner border + more faded background.
- **Stats differentiation — metric**: `viewCount` from `statistics.viewCount` only. Normalized relative to the current dataset (min–max across all visible pins).
- **Stats differentiation — implementation**: CSS padding on `.image-container` (range: `1px`–`8px`) controls border thickness; rgba opacity on `.bg-color` background (range: `0.35`–`1.0`) controls vividness. Total pin footprint stays fixed.
- **Zoom-responsive pins**: At zoom < 3, apply `.map--low-zoom` class to the map container element. CSS handles `transform: scale(0.65)` on `.custom-marker` and `display: none` on `.flag`. Logic extends the existing `MapViewSaver` component (already has `useMap()` + `zoomend` listener).

## Analysis

### Affected Files

**Modified**
- `src/Map/Map.jsx` — extend `MapViewSaver` to toggle `.map--low-zoom` class on `zoomend`; pass `toggleSidebar` and `setMapPoint` into `<Countries>`; pass full `data` object to `processPoint` calls for normalization.
- `src/Map/Points/Points.js` — remove dead random code; implement real `setUpPointAttributes` using normalized `viewCount`; apply padding and rgba opacity in `changePointAppearance`.
- `src/Map/Countries/Countries.jsx` — accept `toggleSidebar` and `setMapPoint` props; call them in `handleCountryClick` after `map.setView`.
- `src/Map/Countries/Countries.scss` (or equivalent marker stylesheet) — add `.map--low-zoom` rules for pin scale and flag visibility.

### Risks & Concerns

- **Hex-to-rgba conversion**: `bgColor` is currently built as a 6-char hex string. Converting to `rgba()` requires parsing the three pairs as decimals. Must handle edge cases (short hex, missing chars already guarded by the existing `bgColor` builder).
- **Normalization with single-point dataset**: If only one country has data (e.g. a very niche category), min === max and division by zero occurs. Must clamp: if `range === 0`, use `normalized = 1` (single point gets full prominence).
- **`countryData[0].flag` in Countries**: `Map.jsx` mutates `data[alpha2][0].flag` during render. Since the same object reference is in `dataRef.current`, the flag will be set by the time a click fires. No extra call to `getFlagFromAlpha2` needed in `Countries`.
- **`transform-origin: bottom center`**: Leaflet positions markers by their anchor point (bottom-centre). CSS scale must use the same origin to keep pins anchored to their coordinates visually.
- **Padding range vs. image aspect ratio**: Channel avatars are square/round thumbnails. Adding up to 8px padding on all sides reduces the visible image but does not distort it. Safe.

### Decisions

- **Metric**: `viewCount` only — primary popularity signal, directly interpretable, avoids composite calibration complexity.
- **Normalization**: min–max relative to current dataset. Single-point edge case returns `normalized = 1`.
- **Border thickness**: padding on `.image-container` (1px–8px). More `viewCount` = more padding = thicker border ring.
- **Background opacity**: rgba on `.bg-color` (0.35–1.0). More `viewCount` = higher opacity = more vivid.
- **Zoom classes**: `.map--low-zoom` toggled by extending `MapViewSaver`. Applied to the `.map-container` div (the wrapper, not the Leaflet canvas).
- **Pin scale at low zoom**: `transform: scale(0.65)` with `transform-origin: bottom center` via CSS class.

## Implementation Plan

- [x] Step 1: Remove dead random code from `src/Map/Points/Points.js` — delete `value`, `score`, `size`, `opa`, `color`, `getRandomFloat`, and all commented-out lines that reference them; leave `bgColor` logic and `changePointAppearance` skeleton intact.
- [x] Step 2: Implement stat-based `setUpPointAttributes` in `src/Map/Points/Points.js` — accept `viewCount`, `minViews`, `maxViews`; compute normalized 0–1 value (guard division by zero); return `padding` (1–8px) and `bgOpacity` (0.35–1.0); update `changePointAppearance` to apply padding on `.image-container` and rgba background on `.bg-color` elements.
- [ ] Step 3: Thread normalization data through `src/Map/Map.jsx` — compute `minViews`/`maxViews` from `data` before the `processPoint` loop; pass them into `processPoint` (and down to `setUpPointAttributes`).
- [ ] Step 4: Wire sidebar into country clicks in `src/Map/Countries/Countries.jsx` — add `toggleSidebar` and `setMapPoint` props; call `setMapPoint(countryData[0])` then `toggleSidebar(true)` inside `handleCountryClick` after the existing `map.setView` call.
- [ ] Step 5: Pass `toggleSidebar` and `setMapPoint` from `src/Map/Map.jsx` into `<Countries>`.
- [ ] Step 6: Add zoom-responsive behaviour — extend `MapViewSaver` in `src/Map/Map.jsx` to toggle `.map--low-zoom` on the `.map-container` element on `zoomend` (and on mount); add CSS rules in the marker stylesheet for `scale(0.65)` and flag `display: none` under `.map--low-zoom`.
- [ ] Step 7: Manual QA — verify all acceptance criteria: sidebar on country click, stat-based pin appearance, zoom-responsive sizing and flag visibility, no console errors.
