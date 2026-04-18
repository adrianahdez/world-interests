# Spec for Channel Images Not Loading In Map Pin

branch: bugfix/WIF-12-Channel-Images-Not-Loading-In-Map-Pin

## Summary
Channel images shown inside the map pin for a country occasionally fail to load and remain broken for the entire session, even though the same image URL opens correctly when pasted into another browser tab. A previous attempt fixed this by silently retrying the fetch after some time, but the retry does not recover the image: no matter how long the user waits, the map pin keeps showing the broken/placeholder state while the URL is demonstrably reachable.

The goal of this bugfix is to reliably display the channel image in the map pin whenever the image URL is actually available, and to ensure that any recovery mechanism (retry, fallback, reload) actually succeeds instead of silently failing.

## Functional Requirements
- When a channel image URL is reachable (returns a valid image when opened directly in the browser), the map pin must display that image.
- If the first load attempt fails, the app must recover automatically without requiring the user to refresh the page or reselect the country/category.
- The recovery mechanism must actually result in the image being rendered once it becomes (or already is) available — not just re-trigger a request that ends in the same failed state.
- The fix must work consistently for all channel images displayed in map pins, regardless of country or category.
- The fix must not regress the behavior of pins whose images already load correctly on the first attempt.

## Possible Edge Cases
- The image URL is valid but the first request fails due to a transient network error, CORS/referrer policy, rate limiting, or cached failed response.
- The browser has cached a previous failed response (e.g. an opaque or error response) for the same URL and keeps serving it to subsequent requests from the app.
- The image element is reused or memoized across renders, so updating the `src` does not actually trigger a new network request.
- The channel image URL changes between API responses while the pin is already mounted.
- Multiple pins reference the same image URL and share the same failure state.
- The user toggles category, language, or theme while a retry is in flight.
- The image URL points to a third-party host (e.g. YouTube channel thumbnails) that may apply hotlinking protection, referrer checks, or redirect behavior that differs between a direct browser tab load and an `<img>` request from the app.
- Slow connections where the image takes longer than the retry window to load.

## Acceptance Criteria
- Reproducing the original bug (a channel image URL that loads fine in a new tab but fails in the map pin) no longer results in a permanently broken image: the image eventually appears in the pin without any manual user action.
- Pins that previously loaded correctly continue to load correctly, with no visible regressions (no flicker, no duplicated requests storm, no layout shift).
- There is a clear, observable end state for every pin: either the channel image is shown, or a defined fallback is shown — never an indefinite broken state.
- Manual verification in the running dev container confirms the fix for at least one country/category combination that previously exhibited the bug.

## Open Questions
- Is the bug reproducible consistently for specific channels/URLs, or does it appear randomly across different ones? Any concrete URL(s) that reliably trigger it would help diagnosis.
- Does the bug appear only on first visit, only after navigation between categories, or in both cases?
- Is it reproducible in more than one browser (Chrome, Firefox, Safari), and does it depend on being logged into Google/YouTube?
- When the image fails, what does the browser devtools Network tab show for that request (status code, CORS error, blocked by client, etc.)? This is key to deciding whether the fix should target the request strategy, a fallback image, or something else.
- If the root cause turns out to be hotlinking/referrer restrictions by the image host, is it acceptable to route the image through the backend as a proxy, or should the frontend rely on a fallback image instead?
- Should the fallback (when the image truly cannot be loaded) be a generic placeholder, the channel initials, or something else?

## Clarifications

1. **Network status code**: DevTools confirms **429 Too Many Requests** for failing `ggpht.com` image requests, with `Referrer-Policy: strict-origin-when-cross-origin`. This confirms the root cause: the app's `Referer` header triggers CDN rate-limiting.
2. **Scope**: Fix all three image locations — map pin (Map.jsx), InfoSidebar, and CountryPanel.
3. **Retry hook**: Simplify (Option B) — reduce max retries from 5 → 2 and initial delay from 1500ms → 500ms, retaining a minimal safety net for genuine transient errors.

## Analysis

### Affected Files

**Map / Marker layer**
- `src/Map/Map.jsx` — add `referrerpolicy="no-referrer"` to `<img>` at line 402

**Sidebar / Panel**
- `src/InfoSidebar/InfoSidebar.jsx` — add `referrerpolicy="no-referrer"` to `<img>` at line 75
- `src/CountryPanel/CountryPanel.jsx` — add `referrerpolicy="no-referrer"` to `<img>` at lines 186-191

**Hook**
- `src/hooks/useImageRetry.js` — reduce `maxRetries` to 2, initial delay to 500ms

### Risks & Concerns

- **CustomMarker HTML serialization**: The JSX inside `CustomMarker` is rendered to a hidden `<div>`, its `.innerHTML` is extracted, and injected into Leaflet's `DivIcon`. HTML attributes (including `referrerpolicy`) survive this serialization/deserialization, so the fix applies correctly to the non-React Leaflet DOM.
- **`useImageRetry` and retried src**: When the hook sets `img.src` on a retry, the `referrerpolicy` DOM attribute is already present on the element and is preserved — no extra work needed in the hook.
- **No regressions expected**: `referrerpolicy="no-referrer"` is a standard attribute with broad browser support; it does not affect image display, only the outgoing request header.

### Decisions

- **Root cause fix**: Add `referrerpolicy="no-referrer"` to all channel `<img>` tags so the browser omits the `Referer` header, matching the behavior of a direct browser-tab load that the CDN allows.
- **Retry hook**: Simplify rather than remove — transient 5xx CDN errors still occur occasionally, so keeping 2 retries at 500ms is a sensible last resort without the heavy backoff needed for rate-limit recovery.

## Implementation Plan

- [x] Step 1: Add `referrerpolicy="no-referrer"` to the map pin `<img>` in `src/Map/Map.jsx` (line 402).
- [x] Step 2: Add `referrerpolicy="no-referrer"` to the InfoSidebar channel `<img>` in `src/InfoSidebar/InfoSidebar.jsx` (line 75).
- [x] Step 3: Add `referrerpolicy="no-referrer"` to the CountryPanel channel `<img>` in `src/CountryPanel/CountryPanel.jsx` (lines 186–191).
- [x] Step 4: Simplify `src/hooks/useImageRetry.js` — reduce max retries to 2 and initial delay to 500ms.
- [ ] Step 5: Manual verification in the running dev container — confirm that previously broken channel images now load in map pins, InfoSidebar, and CountryPanel without waiting or refreshing.

## Testing Guidelines
Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:
- A channel image that loads successfully on the first attempt renders in the map pin.
- A channel image whose first request fails but is actually reachable ends up rendered in the map pin after recovery, without user interaction.
- A channel image whose URL is genuinely unreachable ends in a defined fallback state rather than an indefinite broken/loading state.
- Changing category/country while a recovery is in flight does not leave stale or broken images attached to unrelated pins.
