# Spec for Persist Map Position And Zoom Level

branch: feature/WIF-5-Persist-Map-Position-And-Zoom-Level

## Summary

Currently, every time the user refreshes the page, the map resets to the hardcoded default center (`[25, 0]`) and zoom level (`3`). On mobile devices this can feel especially disorienting because the default center may not match what the user was exploring. The goal is to persist the map's center coordinates and zoom level across page reloads using localStorage, so the map restores the user's last position automatically. If no saved state exists, the app should fall back to the existing defaults.

This approach is viable, secure, and has negligible performance impact. localStorage reads/writes are synchronous but instant for small payloads (two coordinates + one number). Writes should be debounced on move/zoom events to avoid flooding storage on continuous drag. No sensitive data is involved — map coordinates are non-personal. The URL query string (`?category=`) is already used for category state, but extending it for viewport state would make URLs shareable (a potentially useful alternative), though localStorage is simpler and fits the existing pattern used by LanguageContext and ThemeContext.

## Functional Requirements

- On map load, read saved center and zoom from localStorage. If present and valid, initialize the map with those values instead of the defaults.
- Whenever the user changes the map position (pan/drag) or zoom level, save the new center and zoom to localStorage.
- Writes to localStorage must be debounced (e.g., ~300–500 ms after the last move/zoom event) to avoid excessive writes during continuous interaction.
- If the stored value is missing, malformed, or out of the map's allowed zoom range (`minZoom: 1` / `maxZoom: 5`), silently fall back to the default center and zoom.
- The feature must work consistently on both desktop and mobile.

## Possible Edge Cases

- **Corrupt or tampered localStorage value**: JSON.parse could throw; must be caught and fall back to defaults.
- **Out-of-range zoom**: A stored zoom outside `[1, 5]` should be clamped or discarded to avoid Leaflet errors.
- **Out-of-range coordinates**: Latitude outside `[-90, 90]` or longitude outside `[-180, 180]` must be discarded.
- **localStorage unavailable**: In some private-browsing modes or restricted environments, localStorage access can throw. The save/read logic must be wrapped in try/catch.
- **Stale position after data updates**: The stored position is purely a viewport preference and is independent of category data — no conflict expected, but this should be confirmed.
- **First-time visitors**: No key in localStorage → fall back to defaults gracefully with no console errors.

## Acceptance Criteria

- Reloading the page preserves the map's last center and zoom level.
- On first load (no localStorage entry), the map opens at the existing default center and zoom.
- Panning or zooming triggers a debounced save; rapid interactions do not cause noticeable lag or storage errors.
- An invalid or missing stored value never causes an error or blank map — defaults are used silently.
- Behavior is consistent across desktop browsers and mobile browsers.

## Open Questions

- None — implementation approach is clear. No blockers.

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- Saving and restoring a valid center + zoom from localStorage.
- Falling back to defaults when localStorage is empty.
- Falling back to defaults when localStorage contains malformed JSON.
- Falling back to defaults when coordinates or zoom are out of range.
- Ensuring the save is debounced (not called synchronously on every pixel of drag).

## Clarifications

- **`MapViewSaver` placement**: Option A chosen — defined inline in `Map.jsx` as a local function component above the `Map` function. It is not a reusable public component, so no new file is needed.
- **No tests**: CLAUDE.md confirms there are no tests or linting configured in this project. No test files will be written.
- **Debounce delay**: 400 ms — mid-range of the 300–500 ms spec window, balancing responsiveness and write frequency.

## Analysis

### Affected Files

**Modified**
- `src/Map/Map.jsx` — add localStorage read before `mapConfig` to derive initial center/zoom; add inline `MapViewSaver` component; mount `<MapViewSaver />` inside `<MapContainer>`.

### Risks & Concerns

- **`MapContainer` initial-props constraint**: `center` and `zoom` in react-leaflet are one-time mount props and cannot be changed reactively. The stored value must be read synchronously before render. Mitigation: read and validate localStorage before the `mapConfig` object is constructed.
- **`useMap()` must be called inside `MapContainer`**: The saver component must be a child of `MapContainer`. Mitigation: mount `<MapViewSaver />` as a sibling to `<Countries />` inside `<MapContainer>`.
- **localStorage throws in restricted environments**: Some private-browsing modes disallow localStorage access entirely. Mitigation: wrap all reads and writes in try/catch; fall back to defaults silently.
- **Malformed JSON**: `JSON.parse` on a corrupt value throws. Mitigation: catch the error and return `null` to trigger default fallback.
- **Out-of-range values**: A stored zoom outside `[1, 5]` or coordinates outside valid ranges could cause Leaflet errors. Mitigation: validate all three values after parsing; discard the entire stored state if any value is invalid.

### Decisions

- `MapViewSaver` defined inline in `Map.jsx` (Option A) — it is an implementation detail of `Map`, not a reusable public component.
- Debounce via `useRef` + raw `setTimeout`/`clearTimeout` — no external library needed; matches the retry-queue pattern already in `Map.jsx`.
- localStorage key: `mapView` storing `{ center: [lat, lng], zoom: number }` as JSON.
- Both `moveend` and `zoomend` Leaflet events trigger the debounced save (zoom changes also fire `moveend` on Leaflet, but explicitly listening to both is safer and clearer).

## Implementation Plan

- [x] Step 1: Add localStorage helpers and initial-state read in `src/Map/Map.jsx` — write `saveMapView(center, zoom)` and `loadMapView()` functions above the `Map` component; replace the hardcoded `center` and `zoom` in `mapConfig` with values from `loadMapView()`.
- [ ] Step 2: Add `MapViewSaver` component inline in `src/Map/Map.jsx` — a function component that calls `useMap()`, attaches debounced `moveend` + `zoomend` listeners in a `useEffect`, and cleans up on unmount; mount `<MapViewSaver />` inside `<MapContainer>`.
- [ ] Step 3: Manual QA — verify restore on reload, fallback on cleared storage, and no console errors on malformed data.
