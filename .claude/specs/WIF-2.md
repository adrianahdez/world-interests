# Spec for Frontend Error Handling For Missing Categories

branch: bugfix/WIF-2-Frontend-Error-Handling-For-Missing-Categories

## Summary

When the backend has no data available — for example because the YouTube API daily quota has been exhausted and `categories.json` is missing or empty — the frontend throws an unhandled `SyntaxError` in the console (`Unexpected token '<'... is not valid JSON`). This happens because the backend returns an HTML error page instead of JSON, and the frontend tries to parse it as JSON without checking first.

This looks like a code bug to anyone inspecting the console, when in reality it is an expected operational condition (API quota limits, backend not yet populated, etc.). The goal is to catch this condition gracefully and communicate it clearly to the user — either in the UI, the console, or both — with a message that explains what happened without exposing a raw JavaScript error.

## Functional Requirements

- When the categories endpoint returns a non-JSON response or an empty list, the app does not throw an unhandled error in the console.
- The user sees a friendly message explaining that data is temporarily unavailable (rather than a broken or empty UI with no explanation).
- The console may still log a warning, but it must be a controlled, descriptive message — not a raw JavaScript exception stack trace.
- The same graceful handling applies when the map data endpoint (`get-json.php`) also fails or returns invalid JSON.
- The error state is visually distinct from the normal loading state so the user knows the app is not still loading.

## Possible Edge Cases

- The backend returns a valid HTTP 200 but with an HTML body (e.g. Apache error page) instead of JSON — this is the current failure mode.
- The backend returns a valid HTTP error code (404, 500, 403) with or without a JSON body.
- The backend returns valid JSON but with an empty categories array (`[]` or `{}`).
- The backend is unreachable (network error, container not running).
- Categories load successfully but a subsequent map data request fails for a specific category — the rest of the app should remain functional.

## Acceptance Criteria

- Starting the frontend with the backend offline or with no `categories.json` shows a user-friendly message in the UI instead of a blank or broken state.
- No raw `SyntaxError` or unhandled promise rejection appears in the browser console.
- Starting the frontend with the backend running and data available works exactly as before — no regression.
- The error message is shown in both supported languages (English and Spanish) if the app already has a translation mechanism.

## Open Questions

- Should the error message be shown in the same area where categories normally appear (sidebar/header), or as a full-page/overlay message?
- Should the app keep retrying in the background, or simply show the error and wait for the user to reload?

## Clarifications

1. **Categories error placement:** Show the error message inside the sidebar list area (where categories normally appear), replacing the empty list. This covers both first load and when the user opens the sidebar manually — there is no separate "categories page" in this app, the sidebar dialog is the only entry point. Also log a controlled `console.warn` with a descriptive message (not a raw SyntaxError stack trace).

2. **Map data error:** Keep the Leaflet map visible. When `get-json.php` fails or returns no data, show a centered overlay message on top of the map indicating data is unavailable for the current category. The map polygons and tiles remain visible.

3. **No retry:** Show the error and wait for the user to reload manually. No auto-retry logic.

## Testing Guidelines

There are no automated tests configured in this project (see CLAUDE.md). Validation is manual:

- Stop the backend container and load the frontend — verify a friendly message appears and no raw errors in the console.
- Start the backend but leave `responses/` empty (before running cron) — verify the category list error is handled gracefully.
- Start the backend with full data — verify the app works exactly as before.

## Analysis

### Affected Files

| File | Action | Purpose |
|------|--------|---------|
| `src/Map/Points/Data.js` | Modify | Fix `fetchData()` to check `response.ok` before parsing; catch JSON parse errors and throw descriptive errors; replace `console.error` with `console.warn` in `getData()` |
| `src/Common/translations.js` | Modify | Add error message keys for categories unavailable and map data unavailable in both `en` and `es` |
| `src/Categories/Categories.jsx` | Modify | Add `categoriesError` state; render error message in the list area when fetch fails |
| `src/Map/Map.jsx` | Modify | Add `mapError` state; render a centered overlay message on the map when data fetch fails |

### Risks & Concerns

1. **`getData()` currently returns `[]` on any error, and `Categories.jsx` uses this to set an empty list.** Distinguishing between "empty but valid response" and "error response" requires a new signal — either a separate error state in the component, or a change to what `getData()` returns/throws on error. Since `getData()` is shared by both `Categories` and `Map`, the cleanest approach is to let `getData()` throw on error (removing the internal catch) and let each consumer handle it with their own `.catch()` / `try/catch`.

2. **Changing `getData()` to throw instead of returning `[]` is a breaking change for both callers.** Both `Categories.jsx` and `Map.jsx` already have `.catch()` handlers, so they are prepared for a thrown error — but the behavior change must be verified not to introduce regressions.

3. **The `response.ok` check covers HTTP error codes (4xx, 5xx). The JSON parse error covers HTTP 200 with HTML body (the current failure mode).** Both need to be handled.

4. **The map overlay message needs to sit above the Leaflet map layers** (which use high z-index values). The message must be positioned outside `MapContainer` or with a z-index high enough to appear on top.

### Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| `getData()` error strategy | Let it throw, remove internal catch | Allows callers to set their own error state; cleaner separation of concerns |
| Console output | `console.warn` with descriptive message in each caller | Controlled, informative, not a raw exception stack trace |
| Categories error UI | Message inside the sidebar `<ul>` area | Non-intrusive, fits the existing layout, no new components needed |
| Map error UI | Centered overlay `<div>` inside `.map-container` | Sits above the map, map tiles remain visible |
| Translations | Add keys to existing `translations.js` | Consistent with how all other UI strings are handled |

## Implementation Plan

- [x] Step 1: **Fix `src/Map/Points/Data.js`.** In `fetchData()`: check `response.ok` and throw a descriptive `Error` if not; wrap `response.json()` in a try/catch and throw a descriptive `Error` on parse failure. In `getData()`: remove the internal try/catch so errors propagate to callers; remove `console.error`.

- [x] Step 2: **Add error translations to `src/Common/translations.js`.** Add two new keys to both `en` and `es`: one for categories unavailable (shown in the sidebar) and one for map data unavailable (shown on the map overlay).

- [x] Step 3: **Update `src/Categories/Categories.jsx`.** Add a `categoriesError` state (boolean). In the `.catch()` handler: set `categoriesError(true)`, log a `console.warn` with a descriptive message. In the JSX: when `categoriesError` is true and the sidebar is open, render the error message string instead of the `<ul>` list.

- [x] Step 4: **Update `src/Map/Map.jsx`.** Add a `mapError` state (boolean). In the `.catch()` handler: set `mapError(true)`, log a `console.warn`. In the JSX: when `mapError` is true, render a centered overlay `<div>` inside `.map-container` with the error message. Reset `mapError` to `false` when `category` changes and a new fetch starts.
