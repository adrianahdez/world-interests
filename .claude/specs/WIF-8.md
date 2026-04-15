# Spec for Codebase Audit And Quality Improvements

branch: refactor/WIF-8-Codebase-Audit-And-Quality-Improvements

## Summary

A comprehensive audit of the world-interests React app revealed bugs, security issues, edge cases, architectural weaknesses, performance inefficiencies, accessibility gaps, and UX problems. This spec enumerates all findings as discrete implementation steps, ordered by severity and impact, so they can be prioritized and implemented incrementally. The goal is to stabilize, harden, and simplify the existing codebase — not add features — while setting up clean architectural patterns that will support the app's planned growth.

---

## Functional Requirements (Implementation Steps)

Each step is a self-contained task. Complexity notation: **Low** = 1–2 hours, **Medium** = half a day, **High** = full day+.

---

### CRITICAL — Bugs

**Step 1 — Fix resize event listener memory leak in Points.js**
*Complexity: Medium*

`processPoint()` is called once per country per data load. Each call attaches a `window resize` listener that is never removed. After switching categories or refreshing data, hundreds of listeners accumulate, all firing on every resize, referencing stale `minViews`/`maxViews`. The resize listener must be registered once (in `Map.jsx`'s `useEffect`) and cleaned up on unmount. `processPoint()` must only compute and apply styles — it must not register event listeners.

**Step 2 — Fix race condition with orphaned retry timers on rapid category switch**
*Complexity: Low*

When a category changes while a data fetch is retrying, the `cancelled` flag stops the state update, but the pending `setTimeout` for the retry still holds a reference and fires. The retry logic must check the cancelled flag before scheduling the next retry attempt. Also, all pending timers must be cleared in the `useEffect` cleanup function.

---

### HIGH — Security

**Step 3 — Add `rel="noopener noreferrer"` to all external links**
*Complexity: Low*

All links that use `target="_blank"` in `InfoSidebar.jsx` and `Footer.jsx` are missing `rel="noopener noreferrer"`. This allows the opened page to access `window.opener` and manipulate the parent tab. Since YouTube URLs come from backend data, a compromised backend could inject malicious URLs. Every `target="_blank"` link must include this attribute.

**Step 4 — Sanitize backend-derived data used in DOM selectors**
*Complexity: Low*

In `Points.js`, `point.regionName` from the backend is interpolated directly into a `document.querySelector()` string: `.custom-marker__point[data-region="${point.regionName}"]`. If `regionName` contains quotes or CSS special characters, the selector can break or behave unexpectedly. The value must be escaped or the query rewritten to avoid string interpolation.

**Step 5 — Move hardcoded Google Analytics ID to environment variable**
*Complexity: Low*

The GA tracking ID `G-MDKV0QPB8F` is hardcoded in `Head.jsx`. It should be loaded from a `REACT_APP_GA_ID` environment variable so different IDs can be used per environment (dev, staging, prod) without touching source code.

---

### HIGH — Edge Cases

**Step 6 — Add defensive null checks in marker rendering for missing backend data**
*Complexity: Medium*

`renderMarkers()` in `Map.jsx` assumes all countries have valid channel data. If the backend returns a country with a missing `channel` object, or if `getCountryLatLon()` returns null, the render can silently skip the marker with no user feedback. Each missing data case must be explicitly handled: log a warning, skip rendering that marker, and not propagate errors to other markers.

**Step 7 — Add retry behavior to category fetch (mirrors map data fetch)**
*Complexity: Medium*

`Categories.jsx` shows a permanent error state if the initial fetch fails — there is no retry mechanism, unlike the map data fetch which has automatic retries with delays. The categories fetch must have the same retry strategy (up to N retries with exponential or fixed delays). If all retries fail, show the error state with a manual "Retry" button.

**Step 8 — Make localStorage failures non-silent**
*Complexity: Low*

Multiple places catch localStorage read/write errors with `catch (_) {}`, silently discarding them. If localStorage is disabled (e.g., private browsing, quota exceeded), user preferences (theme, language, map view) will not persist with no explanation. These catches must log a `console.warn()` at minimum, so developers can diagnose issues and the behavior can be surfaced to users if needed.

---

### MEDIUM — Architecture (Extensibility)

**Step 9 — Refactor Map.jsx by extracting custom hooks for data fetching and image retry**
*Complexity: High*

`Map.jsx` is 516 lines and mixes: data fetching and retry logic, image error queue management, hover/label state, clustering setup, marker rendering, map view persistence, fullscreen toggling, and settings persistence. This makes it hard to test, modify, or reuse any single concern. Extract at minimum:
- `useMapData(category)` hook — handles fetching, retries, loading/error states
- `useImageRetry()` hook — manages the image error queue and retry logic

The component itself becomes an orchestrator that delegates to these hooks.

**Step 10 — Reduce prop drilling by introducing MapPoint and Sidebar contexts**
*Complexity: Medium*

`mapPoint`, `setMapPoint`, `isSidebarOpen`, and `toggleSidebar` are threaded from `App` through `Map` down to `CustomMarker` and back up to `InfoSidebar`. As the component tree grows, this becomes a maintenance burden. Create:
- `MapPointContext` — provides `mapPoint` and `setMapPoint`
- `SidebarContext` — provides `isSidebarOpen` and `toggleSidebar`

Components that need these values consume the context directly instead of receiving them as props.

**Step 11 — Separate pure calculations from DOM mutation in Points.js**
*Complexity: Medium*

`Points.js` mixes pure data computation (color selection, opacity/padding calculation) with DOM manipulation (querySelector, style setting, event listener registration). Pure functions are testable and reusable; DOM mutation is a side effect that must be isolated. Extract:
- `calculatePointAttributes(point, minViews, maxViews)` — pure function returning `{ color, opacity, padding, brightness }`
- Apply the result separately in a React effect or dedicated renderer

**Step 12 — Harden global DOM queries with null guards**
*Complexity: Low*

`Points.js` calls `document.getElementById('app').clientWidth` without a null check. If the `#app` element is ever renamed or the DOM structure changes, this throws a runtime TypeError. Add a null guard that falls back to `window.innerWidth`/`window.innerHeight`.

---

### MEDIUM — Performance

**Step 13 — Debounce the resize handler in Points.js**
*Complexity: Medium*

The resize listener added by `processPoint()` (and, after Step 1, moved to `Map.jsx`) calls `changePointAppearance()` synchronously on every resize event, which can fire dozens of times per second while dragging a window border. This causes layout thrashing. The handler must be debounced (300ms is appropriate) so style recalculation only runs after the user stops resizing.

**Step 14 — Memoize renderMarkers output to prevent unnecessary Leaflet marker remounts**
*Complexity: Low*

`renderMarkers()` is called in the component body without memoization. On every render (including unrelated state changes), all markers are recreated. Wrap the marker array in `useMemo` keyed on `data`, so Leaflet only remounts markers when the data actually changes.

**Step 15 — Replace GeoJSON remount strategy with layer-level style updates**
*Complexity: Medium*

`Countries.jsx` uses a `key` prop that changes on every category/data change, causing Leaflet to unmount and remount the entire GeoJSON layer to re-apply styles. For large or dense country geometries, this is expensive. Instead, keep the layer mounted and call `layer.setStyle()` on the existing Leaflet layer reference when style needs updating.

---

### LOW-MEDIUM — UX

**Step 16 — Show loading state in Categories dialog while fetching**
*Complexity: Low*

When the Categories dialog is opened for the first time (or after a failed fetch), the list area is blank while data loads. Users see an empty dialog and may close it thinking it is broken. A loading spinner or skeleton must be shown in the list area while `categoryNames` is empty and a fetch is in progress.

**Step 17 — Add "Retry" button to categories error state**
*Complexity: Low*

When category fetching fails (after retries from Step 7), users currently see an error message but must refresh the page to try again. A "Retry" button next to the error message must allow re-triggering the fetch without a full page reload.

**Step 18 — Add loading feedback on map when category changes**
*Complexity: Low*

After selecting a new category on mobile or desktop, the dialog closes but the map shows old data silently while new data loads. The existing map loading overlay must be displayed immediately when a category change is initiated, giving visual feedback that a new load is in progress.

**Step 19 — Allow settings/categories access when map error overlay is visible**
*Complexity: Medium*

When map data fails to load, the error overlay covers the map, and `pointer-events: none` is applied to it. However, no controls (settings panel, category selector) are accessible while the error state is active. The error overlay must be dismissible or scoped so that Settings and Categories controls remain interactive.

**Step 20 — Add visual feedback for selected country on polygon click**
*Complexity: Low*

Clicking a country polygon opens the sidebar but leaves no visual indication on the map of which country was selected. The selected country polygon should retain a distinct style (e.g., different fill color or border) until another country is clicked or the sidebar is closed. This is consistent with the existing hover highlight behavior.

---

### LOW — Accessibility

**Step 21 — Fix descriptive alt text for channel images**
*Complexity: Low*

The channel image in `InfoSidebar.jsx` has `alt="marker"`, which is generic and unhelpful to screen reader users. The alt text must be descriptive: `alt="${channelTitle} channel logo"` or equivalent.

**Step 22 — Fix `role="menu"` misuse in MapSettings**
*Complexity: Low*

`MapSettings.jsx` uses `role="menu"` on a panel containing checkboxes. Menu is the wrong ARIA role here — it implies keyboard-navigable menu items. The correct structure is a `role="region"` or a `<fieldset>` with a `<legend>`, grouping the checkboxes semantically.

**Step 23 — Add `aria-live` region for map loading state**
*Complexity: Low*

The map loading overlay is shown/hidden visually but never announced to screen readers. Adding `role="status"` and `aria-live="polite"` to the loading overlay ensures screen reader users know when data is loading and when it finishes.

**Step 24 — Fix close buttons using wrong `type` attribute**
*Complexity: Low*

The Categories dialog close button uses `type="reset"`, which semantically resets a form. The button's purpose is to close the dialog. It must use `type="button"` and have a visible focus indicator (`:focus-visible` outline) so keyboard users can identify and activate it.

---

### LOW — Code Quality

**Step 25 — Replace magic numbers with named constants**
*Complexity: Low*

Hardcoded numbers in `Points.js` (opacity multipliers, padding ratios), `Map.jsx` (retry delays), and `CustomMarker.jsx` (icon sizes, anchor offsets) carry no semantic meaning. Each must be replaced with a named constant in `config.js` or a local constants block, with an inline comment explaining the value's purpose.

**Step 26 — Standardize null/undefined handling patterns**
*Complexity: Low*

The codebase mixes `?.`, `||`, `??`, and direct null checks inconsistently. Some accesses like `point.channel.channelTitle` have no null guard while adjacent code uses optional chaining. Audit all data access from backend-derived objects and apply consistent `?.` optional chaining and `??` null coalescing.

**Step 27 — Remove or resolve all commented-out code**
*Complexity: Low*

`App.jsx` has a commented-out `useEffect` with a note saying "I think this is not necessary". `CustomMarker.jsx` has commented-out dependency array alternatives. Commented code that is not needed must be deleted. If preserved intentionally, it must have a comment referencing the ticket or reason.

**Step 28 — Add PropTypes to all components**
*Complexity: Low*

None of the React components validate their props. Components like `MapSettings` receive 10+ props with no type validation. Add `PropTypes` declarations to every component so prop misuse is caught at development time with clear warnings.

---

## Possible Edge Cases

- Step 1 fix must handle the case where `Map.jsx` unmounts before the resize listener cleanup runs (e.g., fast navigation away from map)
- Step 6 must handle backend returning an empty array vs. null vs. a partial country object (missing channel, missing alpha2)
- Step 7 retry logic in Categories must not retry if the component has unmounted
- Step 9 custom hooks must expose the same API surface as the current inline logic to avoid regressions in Map.jsx
- Step 10 context introduction must not break existing tests or cause components outside the context tree to lose access to values
- Step 13 debounce must not delay the initial style application on page load — only subsequent resize events
- Step 15 GeoJSON layer ref must be properly acquired and checked before calling `setStyle()`; if the layer hasn't mounted yet, fall back to the key-remount approach

## Acceptance Criteria

- No additional `resize` event listeners accumulate when switching categories (verifiable in browser DevTools → Event Listeners)
- All external `target="_blank"` links include `rel="noopener noreferrer"`
- GA ID is loaded from `REACT_APP_GA_ID` env var; build fails gracefully (or uses a default) if not set
- Categories dialog shows a spinner while loading and a retry button on error
- Map loading overlay appears immediately when a category is selected
- A selected country polygon remains visually highlighted on the map
- `Map.jsx` is broken into at minimum two custom hooks; the file is under 300 lines
- `Points.js` pure calculation functions are separated from DOM mutation
- All `target="_blank"` links pass a browser accessibility audit (Lighthouse or axe)
- `MapSettings` panel passes `role` attribute validation in an accessibility checker
- No commented-out code remains in `App.jsx` or `CustomMarker.jsx`
- All components have `PropTypes` declarations

## Open Questions

- **Step 5 (GA ID env var)**: Should the app silently omit GA tracking if `REACT_APP_GA_ID` is not set, or should the build warn/fail?
- **Step 9 (Map.jsx refactor)**: Should `useMapData` live in the `Map/` folder or in a shared `hooks/` directory? Decide before implementation to set the convention for future hooks.
- **Step 10 (contexts)**: Should `MapPointContext` and `SidebarContext` be merged into a single `UIContext`, or kept separate? Consider likely future consumers when deciding.
- **Step 15 (GeoJSON strategy)**: Is the current remount approach intentional for any correctness reason (e.g., forcing Leaflet to re-evaluate GeoJSON features), or is it purely a style workaround?
- **Step 28 (PropTypes vs TypeScript)**: Is there appetite for migrating to TypeScript in the future? If so, skip PropTypes and plan for a TypeScript migration as a separate chore ticket.

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- Verify no resize listeners remain after unmounting the Map component
- Verify category switch while a fetch is in-progress does not apply the stale fetch result
- Verify `calculatePointAttributes()` returns correct color/opacity/padding for min, max, and mid view count values
- Verify `InfoSidebar` renders a descriptive alt text on the channel image
- Verify the Categories dialog shows a loading indicator before data arrives and an error + retry button on failure

---

## Clarifications

**Q1 — GA ID env var behavior:**
`REACT_APP_GA_ID` belongs only in `.env.production`. In a development build, if it is not set: log a `console.warn` explaining it is expected in `.env.production`, then skip GA entirely. In a production build, if it is not set: silently fall back to the current hardcoded ID `G-MDKV0QPB8F`. No warn in production — the fallback is intentional backward-compat.

**Q2 — Hook directory:** `src/hooks/` — top-level shared directory, sets the convention for future cross-feature hooks.

**Q3 — Context granularity:** Two separate contexts: `MapPointContext` and `SidebarContext`.

**Q4 — GeoJSON strategy:** Replace the key-remount with `useRef` + `layer.setStyle()` for better performance at scale.

**Q5 — PropTypes vs TypeScript:** Add PropTypes now.

**Q6 — Step 2 race condition:** Confirmed already correctly handled. `cancelled` and `retryTimer` share the same closure scope; `attempt()` reassigning `retryTimer` inside `.catch()` is visible to the cleanup function, and JavaScript's single-threaded event loop ensures `.catch()` runs atomically. Step 2 is removed from the plan.

**Q7 — Error overlay blocking:** The overlay already has `pointer-events: none` in CSS; the settings gear is positioned independently and is never blocked. Step 19 is removed from the plan.

**Q8 — Selected country highlight:** Implement as a standalone step after the contexts (Step 10) are in place, consuming `MapPointContext` in `Countries.jsx` to know the selected alpha2.

---

## Analysis

### Affected Files

**Modified — Core map logic**
- `src/Map/Map.jsx` — remove resize registration from `processPoint` call, extract hooks, memoize markers, pass selected alpha2 to Countries, add `aria-live` to loading overlay
- `src/Map/Points/Points.js` — extract `calculatePointAttributes()` as pure export, remove `processPoint`'s inline `window.addEventListener`, add null guard for `#app`, add debounce to resize handler registered externally
- `src/Map/Countries/Countries.jsx` — replace key-remount strategy with `useRef` + `layer.setStyle()`, accept selected alpha2, apply highlight style

**Modified — Components**
- `src/App/App.jsx` — wrap tree with `MapPointContext.Provider` and `SidebarContext.Provider`, remove commented-out `useEffect`, pass selected alpha2 down to Map for forwarding to Countries
- `src/Categories/Categories.jsx` — add loading state, retry logic, retry button, fix close button `type`, add `isLoading` state
- `src/InfoSidebar/InfoSidebar.jsx` — consume `MapPointContext` and `SidebarContext` (remove props), fix `alt` text, fix close button `type`, add `rel="noopener noreferrer"` to channel link
- `src/CustomMarker/CustomMarker.jsx` — consume `MapPointContext` and `SidebarContext`, replace magic numbers with named constants, remove commented dependency alternatives
- `src/Map/MapSettings/MapSettings.jsx` — fix `role="menu"` → `role="region"` with correct child roles
- `src/Head/Head.jsx` — replace hardcoded GA ID with `process.env.REACT_APP_GA_ID` and fallback logic
- `src/Footer/Footer.jsx` — add `rel="noopener noreferrer"` to external link
- `src/config.js` — add named constants for marker icon size, icon anchor, point opacity/padding multipliers, retry delays

**New files**
- `src/hooks/useMapData.js` — data fetching + retry logic extracted from Map.jsx
- `src/hooks/useImageRetry.js` — image error queue + retry logic extracted from Map.jsx
- `src/Common/MapPointContext.jsx` — context for `mapPoint` and `setMapPoint`
- `src/Common/SidebarContext.jsx` — context for `isSidebarOpen` and `toggleSidebar`

**Possibly modified — Styles**
- `src/Categories/Categories.scss` — loading spinner, retry button styles
- `src/Map/Countries/Countries.scss` — selected country polygon highlight style

### Risks & Concerns

- **Points.js resize refactor (Step 1 + 6):** After removing `window.addEventListener` from `processPoint`, the single listener must be registered in `Map.jsx`'s `useEffect` and call a function that iterates all current data points. The `data` ref must be up-to-date inside the resize handler to avoid stale closure issues — use a `useRef` for data, same pattern as `processAllPointsRef.current` already used.
- **Hook extraction (Step 4):** `useMapData` needs access to `category` (prop) and must expose `{ data, isLoading, mapError, retryCount }`. `useImageRetry` needs no arguments and just mounts/unmounts its document-level listeners. Both hooks must be extracted without changing observable behavior.
- **Context introduction (Step 5):** `CustomMarker` currently receives `toggleSidebar`, `setMapPoint`, and `mapPoint` as props from `Map`. After contexts are introduced, `Map` stops passing these as props; `CustomMarker` and `InfoSidebar` read from context directly. `App` becomes the single provider. All three components must be updated together in one commit to avoid a broken intermediate state.
- **GeoJSON layer.setStyle() (Step 7):** react-leaflet's `GeoJSON` component doesn't expose a ref to the underlying Leaflet layer directly. Must use the `ref` prop with a callback or `useRef` + `whenReady`/`onAdd` to capture the layer after it mounts. If the ref is null on first render, the old key-based remount must be used as a fallback.
- **Selected country highlight (Step 10):** The selected alpha2 lives in `MapPointContext` (as `mapPoint.alpha2` or similar). `Countries.jsx` reads from context; when the selected alpha2 changes, it calls `setStyle()` on individual layers. Requires iterating `layer.eachLayer()` to find the matching feature — must guard against the layer not yet being mounted.
- **Categories retry (Step 8):** The current effect depends on `[isDialogOpen, isEs]`, which means opening/closing the dialog already retriggers the fetch. The retry logic should add an internal `retryAttempt` counter to the dependency array so it's explicitly controllable, rather than relying on dialog open/close as a retry trigger.
- **No test framework configured:** Per `CLAUDE.md`, there are no tests or linting configured. Testing guideline items from the spec cannot be automated — they must be verified manually in the browser during implementation.

### Decisions

- **Resize handler lifecycle:** The single `window resize` listener will be registered in `Map.jsx`'s data `useEffect` (the one that runs `processAllPoints`), cleaned up in its return. This co-locates the listener with the data it needs and avoids a separate `useEffect`.
- **`calculatePointAttributes` export:** Will be a named export from `Points.js` so it can be called from `Map.jsx`'s resize handler with the current min/max views, decoupling the calculation from DOM access.
- **Context providers location:** `MapPointContext.Provider` and `SidebarContext.Provider` will be added inside `App.jsx` wrapping its JSX, not in `index.js`, to keep them scoped to the app shell and close to the state they manage.
- **GeoJSON ref capture:** Will use react-leaflet's `ref` prop on `<GeoJSON>` (which gives the Leaflet layer instance) via `useRef`. If the ref is null when `styleFunc` changes, log a warning and do nothing (graceful degradation).
- **GA env var:** Logic lives entirely in `Head.jsx`. In development (`NODE_ENV !== 'production'`): if `REACT_APP_GA_ID` is absent, log a `console.warn` and skip GA. In production: use `REACT_APP_GA_ID ?? 'G-MDKV0QPB8F'` as the ID with no warning.

---

## Implementation Plan

- [x] **Step 1 — Fix resize listener memory leak (Points.js + Map.jsx)**
  Modify `Points.js`: export `calculatePointAttributes(point, minViews, maxViews)` as a pure named export. Remove `window.addEventListener` from `processPoint`. Keep `changePointAppearance` and `processPoint` for existing callers but have `processPoint` only call `resize()` once (no listener). In `Map.jsx`: in the `useEffect` that calls `runProcessPoint`, register a single debounced `window resize` listener that calls `runProcessPoint()`, stored in a ref so it survives re-renders. Clean up the listener in the effect's return.

- [x] **Step 2 — Security hardening (Head.jsx, InfoSidebar.jsx, Footer.jsx, Points.js)**
  `Head.jsx`: replace both hardcoded `'G-MDKV0QPB8F'` strings with `process.env.REACT_APP_GA_ID ?? 'G-MDKV0QPB8F'`; add dev-only `console.warn` if `REACT_APP_GA_ID` is absent. Add `REACT_APP_GA_ID=G-MDKV0QPB8F` to `.env.production` (create if absent). `InfoSidebar.jsx`: add `rel="noopener noreferrer"` to both `target="_blank"` links. `Footer.jsx`: add `rel="noopener noreferrer"` to the GitHub link. `Points.js`: rewrite `changePointAppearance` to find the marker element by iterating `document.querySelectorAll('.custom-marker__point')` and comparing the stored `data-region` via `element.dataset.region` (no string interpolation in the selector).

- [x] **Step 3 — Defensive null checks + localStorage warnings**
  `Map.jsx` `renderMarkers()`: guard `countryData.channel` before accessing `c.channelTitle` (currently crashes if channel is null). Add `console.warn` for missing lat/lon or missing channel. `Map.jsx` `saveMapView`: replace `catch (_) {}` with `catch (e) { console.warn(...) }`. Same for the three settings `useEffect` catches. `App.jsx`: same for `toggleDialog`, `toggleSidebar`, `handleSetMapPoint`, `handleUpdateCategory` localStorage writes. `LanguageContext.jsx` and `ThemeContext.jsx`: replace silent catches with `console.warn`.

- [x] **Step 4 — Refactor Points.js: pure functions, null guard, cleanup**
  `Points.js`: extract `calculatePointAttributes` as a clean pure named export (already done as part of Step 1). Add null guard: `const appEl = document.getElementById('app'); mapWidth = appEl?.clientWidth ?? window.innerWidth;`. Remove the module-level mutable `mapWidth`/`mapHeight`/`scaleFactor` — inline them in the resize function since they're not used outside it. Ensure `processPoint` signature stays unchanged so no call sites break.

- [x] **Step 5 — Extract useMapData and useImageRetry hooks**
  Create `src/hooks/useMapData.js`: move the data fetch `useEffect` from `Map.jsx` (lines 204–251) into this hook. Accepts `category`, returns `{ data, isLoading, mapError, retryCount }`. Create `src/hooks/useImageRetry.js`: move the image retry `useEffect` (lines 256–302) into this hook. No arguments, no return value — mounts/unmounts document listeners internally. Update `Map.jsx` to call both hooks and remove the moved logic. File should shrink by ~100 lines.

- [x] **Step 6 — Introduce MapPointContext and SidebarContext**
  Create `src/Common/MapPointContext.jsx` (context + provider, exposes `{ mapPoint, setMapPoint }`). Create `src/Common/SidebarContext.jsx` (context + provider, exposes `{ isSidebarOpen, toggleSidebar }`). Update `App.jsx`: wrap JSX with both providers, remove `mapPoint`/`setMapPoint`/`isSidebarOpen`/`toggleSidebar` props from `Map`, `InfoSidebar`. Update `Map.jsx`: remove those props from its signature; call `useContext(MapPointContext)` and `useContext(SidebarContext)` instead. Update `CustomMarker.jsx`: consume both contexts, remove same props from signature. Update `InfoSidebar.jsx`: consume both contexts, remove props from signature. All five files change together in one commit.

- [x] **Step 7 — Performance: memoize markers + GeoJSON layer.setStyle()**
  `Map.jsx`: wrap `renderMarkers()` output in `useMemo` keyed on `data` (replaces the bare function call). `Countries.jsx`: add `useRef` to capture the Leaflet GeoJSON layer via the `ref` prop. Remove the `key` prop and the `geoJsonKey` variable. In a `useEffect` that depends on `styleFunc`, call `geoJsonLayerRef.current?.setStyle(styleFunc)`. On initial mount the layer ref is null, so the `style` prop on `<GeoJSON>` handles the first render; subsequent changes go through `setStyle()`.

- [x] **Step 8 — Categories UX: loading state, retry logic, retry button**
  `Categories.jsx`: add `isLoadingCategories` state (true while fetch is in-flight). Add `retryTrigger` state (integer counter, increment to retry). Include `retryTrigger` in the `useEffect` dependency array so incrementing it triggers a new fetch attempt. Implement up to 3 retries with fixed 2s delays inside the effect using the same `cancelled` + `retryTimer` pattern from `useMapData`. Show a loading spinner in the list area while `isLoadingCategories` is true. Show a retry button next to the error message when `categoriesError` is true. Add spinner styles to `Categories.scss`. Fix close button `type="reset"` → `type="button"` in `Categories.jsx` (and same fix in `InfoSidebar.jsx`).

- [x] **Step 9 — Map UX: immediate loading feedback on category change**
  `Map.jsx` / `useMapData`: ensure `isLoading` is set to `true` synchronously at the start of each fetch (before the first `await`). Currently it is — but confirm the state setter fires before the next render. In `App.jsx`, when `handleUpdateCategory` is called, the `isLoading` state in `Map` will flip on the next render after `category` prop updates. This is already the correct flow — verify it is visible immediately in the browser and document the finding. If not visible, add an explicit `isLoadingOverride` state in `App` that is set synchronously and cleared once `Map` signals loading has started.

- [ ] **Step 10 — Map UX: selected country polygon highlight**
  `MapPointContext.jsx`: add `selectedAlpha2` derived from `mapPoint` (or store it explicitly). `Countries.jsx`: consume `MapPointContext`, read `selectedAlpha2`. After the GeoJSON layer mounts (using the ref from Step 7), call `layer.eachLayer()` to find the feature matching `selectedAlpha2` and apply a highlight style (distinct `fillColor` or `weight`). When `selectedAlpha2` changes, clear the previous highlight and apply the new one. Add a `.country--selected` CSS class or inline style via `layer.setStyle()`. Add the selected style to `Countries.scss`.

- [ ] **Step 11 — Accessibility fixes**
  `InfoSidebar.jsx`: change `alt="marker"` → `alt={`${c?.channelTitle ?? 'Channel'} logo`}`. `MapSettings.jsx`: change `role="menu"` → `role="region"` with `aria-label={tr.settingsLabel}`; remove `role="menuitem"` from each `<label>`. `Map.jsx`: add `role="status"` and `aria-live="polite"` to the `.map-loading-overlay` div; add accessible text inside (e.g. the retry message, or a visually-hidden "Loading map data" string). All four button `type="reset"` already fixed in Step 8.

- [ ] **Step 12 — Code quality: constants, null coalescing, dead code, PropTypes**
  `config.js`: add named constants `MARKER_ICON_SIZE`, `MARKER_ICON_ANCHOR`, `PIN_OPACITY_MIN`, `PIN_OPACITY_RANGE`, `PIN_BRIGHTNESS_MIN`, `PIN_BRIGHTNESS_RANGE`, `PIN_PADDING_MIN`, `PIN_PADDING_RANGE` with inline comments. Update `Points.js` and `CustomMarker.jsx` to use them. Audit all backend-derived data accesses in `renderMarkers`, `InfoSidebar`, `Countries`, `CustomMarker` — replace inconsistent `||` with `??` and unguarded accesses with `?.`. `App.jsx`: delete the commented-out `useEffect` (lines 107–113). `CustomMarker.jsx`: delete the two commented-out dependency array lines (63–64). Add `PropTypes` imports and `.propTypes` declarations to: `Map`, `Categories`, `InfoSidebar`, `CustomMarker`, `MapSettings`, `Countries`, `Footer`, `Head`, `HeatmapLayer`. Run `npm run build` to verify the production build succeeds with zero errors.
