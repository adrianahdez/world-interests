# Spec for Country Panel With Trending Stats

branch: feature/WIF-10-Country-Panel-With-Trending-Stats

## Summary

When a user clicks a country polygon on the map, nothing happens beyond centering the map and highlighting the polygon. This feature adds a full-screen country info panel that opens on polygon click and displays historical trending statistics for that country within the currently selected category.

The panel is intentionally different from the channel-pin sidebar (which already shows the current day's top video). The country panel focuses exclusively on **historical data**: which channels have dominated this country in this category over time, how many days of data exist, and what their peak videos were. This gives users something genuinely new that the map surface cannot show.

The data source is the existing SQLite DB (`trend_snapshots`, `channels`, `trending_videos`, `countries`, `categories`). A new backend endpoint is needed; see the Backend Notes section.

---

## Proposed Content & Layout

The panel opens full-screen (or near full-screen, ~90% viewport) to comfortably accommodate a variable-length list without feeling cramped.

### Header
- Country name + flag emoji
- Category currently selected (context reminder)
- **Two complementary data notices, always visible:**
  1. "Based on data from X days" — where X is the count of **distinct calendar days** with at least one snapshot for this country+category. The DB may record multiple snapshots per day; only unique days count. This tells the user how much history backs the rankings.
  2. "Last updated X ago" — a human-readable relative time derived from the most recent `captured_at` timestamp across all snapshots for this country+category. Precision adapts to distance: < 2 days → "today" / "yesterday"; 2–6 days → "X days ago"; 1–3 weeks → "X weeks ago"; 1+ months → "X months ago". This tells the user how fresh the data is.

### Historical Top Channels list
- Ranked list of the top N channels by cumulative view count across all their snapshots in this country+category.
- N is user-configurable via a setting (see Functional Requirements). Default: 3. Max: 10.
- Each channel card shows:
  - Channel avatar + name (linked to YouTube channel page)
  - Their peak video: thumbnail + title + link to YouTube watch page
  - Peak video stats: views, likes, comments (from the snapshot with highest view_count for that video)
  - Number of times this channel appeared in snapshots for this country+category ("seen X times")
- If N is large enough that the list overflows the viewport, the list area scrolls vertically; the header stays fixed.

**Video thumbnails** — YouTube thumbnail URLs follow a stable pattern (`https://img.youtube.com/vi/<video_id>/mqdefault.jpg`) and remain accessible even after a video is deleted. Use these for thumbnails; no extra DB column is needed for thumbnails.

**Unavailable videos** — Historical videos may have been removed from YouTube. Do not auto-play. Mount the `<Player>` embed only on explicit user tap. If the embed fails, YouTube's own "video unavailable" message is shown inside the iframe — this is acceptable with no custom error handling required. The thumbnail and link remain useful regardless.

---

## Functional Requirements

- Clicking a country polygon opens the country info panel. Clicking a channel pin still opens the existing `InfoSidebar` — no regression.
- The panel is full-screen (or ~90% viewport width/height on desktop; full-screen on mobile).
- The panel header shows the country name, flag, and currently selected category name.
- The panel shows "Based on data from X days" where X = count of distinct calendar days with at least one snapshot for that country+category.
- The top-N channel list is ranked by cumulative view count (sum of `view_count` across all snapshots for that channel in this country+category).
- The default value of N is 3. N is configurable in app settings (a new setting, not a URL param). Maximum allowed value for N is 10.
- If the rendered list exceeds the visible panel area, the list scrolls vertically; the header remains fixed.
- The panel fetches data only when it opens or when the country/category combination changes (no polling).
- In-flight requests are cancelled (or their results discarded) if the country or category changes before the response arrives.
- Loading state: show a spinner or skeleton while fetching.
- Empty state (no data for this country in the DB): show a short message, e.g. "No historical data available for this country yet."
- The panel is dismissible via close button and Escape key, consistent with existing `InfoSidebar` behavior.
- When the country panel opens, a `country=<alpha2>` param is added to the browser URL (e.g. `?category=music&country=ES`). When the panel closes, the param is removed. This makes the view shareable and supports browser back/forward navigation.
- On page load, if a `country` param is present in the URL, the panel opens automatically for that country (same as if the user had clicked the polygon).
- The `country` URL param is only used by the country panel. The channel-pin `InfoSidebar` does not write to or read from the URL.
- All static strings have EN and ES translations.
- Dark and light themes are supported.

---

## Backend Notes

> **These items are NOT part of the current implementation. They are documented here for future reference when the backend work is scheduled.**

### API URL strategy — front-controller (Option B)

All backend API routes should be served through a single front-controller entry point (e.g. `api/index.php`) that dispatches internally based on the request path. No `.php` extensions should ever appear in any URL exposed to the frontend or the browser. This hides the implementation language and gives full control over URL shape going forward.

This refactor also covers the two existing endpoints:

| Old URL | New clean URL |
|---|---|
| `/get-json.php?category=<slug>` | `/api/trending?category=<slug>` |
| `/get-category-list.php` | `/api/categories` |

The frontend must be updated to call the new URLs at the same time the backend routing is changed — these two changes must ship together to avoid breakage.

### New endpoint needed

`GET /api/country/history?country=<alpha2>&category=<slug>&limit=<n>`

- `country`: ISO alpha-2 country code (e.g. `ES`)
- `category`: category slug (e.g. `music`)
- `limit`: number of channels to return (1–10, default 3)

**Response shape:**
```json
{
  "days": 42,
  "latest_capture_at": "2026-04-15T21:32:35Z",
  "channels": [
    {
      "youtube_id": "UCxxxxxx",
      "title": "Channel Name",
      "image_url": "https://...",
      "appearances": 38,
      "peak_video": {
        "youtube_id": "dQw4w9WgXcQ",
        "title": "Video Title",
        "view_count": 9500000,
        "like_count": 194000,
        "comment_count": 620,
        "captured_at": "2026-03-15T21:32:35Z"
      }
    }
  ]
}
```

`days` = `COUNT(DISTINCT DATE(captured_at))` filtered to this country+category.
`latest_capture_at` = `MAX(captured_at)` filtered to this country+category — used by the frontend to render the "last updated X ago" notice.
`channels` = top N channels ranked by `SUM(view_count)` across all their snapshots for this country+category, each with their single highest-`view_count` snapshot video.

### DB migration needed: add `thumbnail_url` to `trending_videos`

The `trending_videos` table currently has no thumbnail column. A new `thumbnail_url TEXT` column should be added and backfilled.

**Why this is needed:** YouTube thumbnail URLs (`img.youtube.com/vi/<id>/mqdefault.jpg`) can be constructed client-side from the video ID alone and do not require a DB column — so for the frontend this column is optional. However, storing the thumbnail URL in the DB is useful if the backend ever serves thumbnails directly or if YouTube changes its URL scheme.

**Migration steps (for future backend work):**
1. `ALTER TABLE trending_videos ADD COLUMN thumbnail_url TEXT;`
2. Backfill existing rows: `UPDATE trending_videos SET thumbnail_url = 'https://img.youtube.com/vi/' || youtube_id || '/mqdefault.jpg';`
3. Populate the column in the data-collection script for all future inserts.

---

## Possible Edge Cases

- Country has no data in the DB at all — show the empty state message; do not attempt to render the channel list.
- Country has data for some categories but not the currently selected one — same empty state; the header still shows the country name and category.
- Only one distinct day of data exists — "Based on data from 1 day" is grammatically handled (singular vs plural).
- Multiple snapshots on the same day — deduplicated when computing the `days` count (use `COUNT(DISTINCT DATE(captured_at))`).
- User sets N to a large value (e.g. 10) but only 2 channels exist for that country+category — show only those 2, no empty slots.
- Category changes while the panel is open — re-fetch with the new category slug; show loading state during the transition.
- Network error on fetch — show an error state with a retry button.
- User rapidly clicks different countries — in-flight requests must be cancelled or their results discarded if the selection changed.
- Invalid `country` param in URL on page load (unrecognised alpha-2 code, or a code with no polygon in the GeoJSON) — ignore the param silently and load the map normally without opening the panel.
- User navigates back in browser history to a URL without the `country` param — the panel closes.

---

## Acceptance Criteria

- Clicking any country polygon opens the country info panel (full-screen).
- Clicking a channel pin still opens the existing `InfoSidebar` without any regression.
- The panel header shows the correct country name, flag, and category name.
- "Based on data from X days" reflects the count of distinct calendar days, not raw snapshot count.
- The channel list is ranked by cumulative views, limited to the configured N (default 3, max 10).
- Each channel card shows avatar, name, peak video thumbnail, title, stats, and appearance count.
- The list scrolls vertically when it overflows; the header stays fixed.
- Loading spinner/skeleton is shown while fetching.
- Empty state message is shown when no data exists for the country+category.
- The panel closes on close-button click and on Escape key.
- All text is translated for both EN and ES.
- No visual regression in the existing channel-pin `InfoSidebar`.

---

## Open Questions

*(All resolved — see Clarifications below.)*

---

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- Country polygon click opens the country panel; channel pin click opens the existing `InfoSidebar` (no regression).
- Panel closes on Escape key and on close-button click.
- "Based on data from X days" correctly reflects distinct calendar days (not raw snapshot count).
- Channel list renders the correct number of entries respecting the configured N.
- Loading and empty states render correctly.
- Category change while panel is open triggers a re-fetch with the new slug.

---

## Clarifications

1. **New component** — `CountryPanel` is a new `<dialog>`-based component separate from `InfoSidebar`. Open/close animation logic (~15 lines) is duplicated rather than coupled. The two panels share only global SCSS variables from `_sidebars.scss` and `_helpers.scss`.

2. **N setting in MapSettings** — The number-of-channels setting lives in the existing `MapSettings` panel alongside heatmap, clustering, flags, etc. It is persisted to `localStorage` under a new key (`STORAGE_KEY_COUNTRY_CHANNELS`). Default: 3. Max: 10.

3. **Fewer channels than N** — If the endpoint returns fewer channels than N (because fewer exist in the DB for that country+category), the panel displays only those returned and shows a small notice: e.g. "Showing 2 of 5 requested channels". No minimum-days threshold — the panel shows whatever data exists from day one.

4. **Backend endpoint scope** — The new `/api/country/history` endpoint is **not implemented in this ticket**. The frontend panel is built now; the `useCountryHistory` hook handles a failed/empty response gracefully (empty state). The backend implementation will follow in a dedicated backend ticket using this spec as the contract.

5. **API URL refactor** — The two existing endpoints (`get-json.php` → `/api/trending`, `get-category-list.php` → `/api/categories`) are refactored in **both** frontend and backend in this ticket. A new `public/.htaccess` and front-controller `public/index.php` handle routing. The old PHP files remain untouched as a safe fallback during the deployment window and can be removed in a later cleanup.

6. **`country` URL param uses `pushState`; `category` keeps `replaceState`** — Opening the country panel calls `history.pushState` so the browser Back button closes the panel. A `popstate` listener in `App.jsx` handles this. Changing category keeps `history.replaceState` (no back-button history entry) because category acts as a filter, not navigation. Adding a `popstate` listener for category would mean 5 Back presses to exit the app after browsing categories, which is worse UX.

---

## Analysis

### Affected Files

**Backend (`world-interests-backend`)**

| File | Change |
|---|---|
| `public/.htaccess` | New — rewrites `/api/*` to `index.php` via `mod_rewrite` |
| `public/index.php` | Rewrite — front-controller router dispatching `/api/trending` and `/api/categories`; 501 stub for `/api/country/history` |
| `CLAUDE.md` | Update endpoint table to reflect new clean URLs |

**Frontend (`world-interests`)**

| File | Change |
|---|---|
| `src/config.js` | Add `STORAGE_KEY_COUNTRY_CHANNELS`, `COUNTRY_CHANNELS_DEFAULT = 3`, `COUNTRY_CHANNELS_MAX = 10` |
| `src/hooks/useMapData.js` | Update URL from `get-json.php?category=` → `api/trending?category=` |
| `src/Categories/Categories.jsx` | Update URL from `get-category-list.php` → `api/categories` |
| `src/Common/CountryPanelContext.jsx` | New — context providing `isCountryPanelOpen`, `selectedCountry`, `openCountryPanel`, `closeCountryPanel` |
| `src/App/App.jsx` | Add country panel state, `pushState`/`popstate` URL management, `CountryPanelContext.Provider`, mutual-exclusion with `InfoSidebar` |
| `src/Map/Countries/Countries.jsx` | Wire `handleCountryClick` → consume `CountryPanelContext.openCountryPanel` |
| `src/hooks/useCountryHistory.js` | New — fetches `/api/country/history`, handles cancellation, loading, error, empty states |
| `src/Map/MapSettings/MapSettings.jsx` | Add N channel select (1–10) reading/writing `STORAGE_KEY_COUNTRY_CHANNELS` |
| `src/Map/MapSettings/MapSettings.scss` | Style for the new select control |
| `src/Common/translations.js` | All new CountryPanel + MapSettings strings in EN and ES |
| `src/CountryPanel/CountryPanel.jsx` | New — full-screen `<dialog>` panel component |
| `src/CountryPanel/CountryPanel.scss` | New — full-screen layout, channel cards, loading/empty/error states, animations |

---

### Risks & Concerns

- **Mutual exclusion of panels** — `InfoSidebar` and `CountryPanel` must not be open simultaneously. `openCountryPanel` must close `InfoSidebar` without clearing `selectedAlpha2` (polygon highlight). Currently `toggleSidebar(false)` in `App.jsx` calls `setSelectedAlpha2(null)` — this must be guarded so that closing the sidebar when switching to the country panel does not flash the polygon deselection.
- **`pushState` for country + `replaceState` for category** — these two URL strategies coexist in `App.jsx`. The `popstate` handler must check whether the new URL still has a `country` param; if absent, close the panel. It must not interfere with category changes.
- **Stub endpoint returns empty data** — `useCountryHistory` must not show an error spinner when the backend returns a 501; it should treat the response as an empty state and surface a "coming soon" message rather than a generic error.
- **No test runner configured** — per `CLAUDE.md`, no tests or linting are set up. The "testing step" in the plan is a manual smoke-test of the build.
- **Old PHP files remain accessible** — `get-json.php` and `get-category-list.php` stay on disk as a fallback. They should not be removed until the backend ticket confirms the router is stable in production.
- **`Player` id conflict** — `Player.jsx` hard-codes `id="player"` on the div it passes to `YT.Player`. If `CountryPanel` also uses the `<Player>` component, two `id="player"` elements would exist simultaneously (panel + existing sidebar). The `Player` component must be reviewed if the country panel ever adds video playback. For now, the panel only lazy-loads the player on tap — acceptable risk since only one panel is open at a time.

### Decisions

- `CountryPanel` is a new component; does not share state or open/close logic with `InfoSidebar`.
- `country` URL param uses `pushState`; `category` stays on `replaceState`.
- N setting lives in `MapSettings`, persisted to `localStorage`.
- Backend `/api/country/history` is stubbed (501) in this ticket; full implementation is a future backend ticket.
- Old `.php` endpoint files are preserved as fallback; the new front-controller is the canonical path.

---

## Implementation Plan

- [x] **Step 1 — Backend: `.htaccess` + front-controller router**
  Rewrite `public/index.php` as a router that dispatches `GET /api/trending` (→ existing `get-json.php` logic) and `GET /api/categories` (→ existing `get-category-list.php` logic). Return a `501 Not Implemented` JSON stub for `GET /api/country/history`. Add `public/.htaccess` to rewrite `/api/*` to `index.php`. Update `CLAUDE.md` endpoint table.

- [x] **Step 2 — Frontend: API URL constants + config + URL updates**
  Add `STORAGE_KEY_COUNTRY_CHANNELS`, `COUNTRY_CHANNELS_DEFAULT`, `COUNTRY_CHANNELS_MAX` to `src/config.js`. Update `src/hooks/useMapData.js` to call `/api/trending?category=`. Update `src/Categories/Categories.jsx` to call `/api/categories`. Smoke-test that the map and category list still load.

- [x] **Step 3 — Frontend: `CountryPanelContext` + `App.jsx` wiring**
  Create `src/Common/CountryPanelContext.jsx` with `isCountryPanelOpen`, `selectedCountry` (`{ alpha2, countryName, flag }`), `openCountryPanel`, `closeCountryPanel`. Update `App.jsx`: add the state, wrap in `CountryPanelContext.Provider`, add `pushState` on open, `replaceState` on close, `popstate` listener to close when `country` param disappears, and mutual-exclusion logic (opening country panel calls `setIsSidebarOpen(false)` without clearing `selectedAlpha2`; opening the channel-pin sidebar calls `closeCountryPanel`).

- [x] **Step 4 — Frontend: `Countries.jsx` — wire polygon click to open panel**
  In `handleCountryClick`, consume `CountryPanelContext.openCountryPanel(alpha2, countryName, flag)`. Remove the `// TODO` comment. The `setSelectedAlpha2` call already present stays so the polygon highlight fires immediately.

- [x] **Step 5 — Frontend: `useCountryHistory` hook**
  Create `src/hooks/useCountryHistory.js`. Fetches `REACT_APP_BACKEND_API_URL + api/country/history?country=<alpha2>&category=<slug>&limit=<n>`. Returns `{ data, isLoading, error }`. Uses an `AbortController` to cancel in-flight requests when `alpha2`, `category`, or `limit` changes. Treats a `501` response as an empty state (not an error) so the panel shows "coming soon" rather than a generic failure.

- [x] **Step 6 — Frontend: MapSettings — N channel setting + translations for it**
  Add a `<select>` control (options 1–10) to `MapSettings.jsx` for the channel count. Read initial value from `localStorage` via `STORAGE_KEY_COUNTRY_CHANNELS` (default `COUNTRY_CHANNELS_DEFAULT`). Persist on change. Pass the current value up to `App.jsx` (or keep it in `Map.jsx` state and pass down to `CountryPanel` via context). Add the EN/ES label strings to `translations.js`.

- [x] **Step 7 — Frontend: remaining `translations.js` strings**
  Add all remaining CountryPanel strings to both EN and ES: panel title format, "Based on data from X day(s)", "Seen X times", "Peak video", "Showing X of Y requested channels", "No historical data available for this country yet.", "Coming soon" / "Data collection in progress", error + retry string, loading aria-label.

- [x] **Step 8 — Frontend: `CountryPanel` component + SCSS**
  Create `src/CountryPanel/CountryPanel.jsx` and `CountryPanel.scss`. Full-screen `<dialog>` with: fixed header (country name + flag + category + days notice), scrollable channel list (cards: avatar, channel name link, peak video thumbnail + title + link, stats row, appearances badge, partial-data notice if channels < N), loading skeleton, empty state, error state with retry button. Escape key + close button. Animations: fade-in/scale on open, fade-out on close (reduced-motion aware). Uses `useCountryHistory` internally.

- [x] **Step 9 — Build verification + manual smoke-test**
  Run `npm run build` in `world-interests`. Confirm zero webpack errors. Then start `npm run dev` and work through this checklist before marking the spec done:

  **Country panel basics**
  - [ ] Click a country polygon → panel opens full-screen with correct country name and flag
  - [ ] Panel header shows the active category name
  - [ ] Panel shows loading state while fetching, then resolves to the "no data yet" empty state (backend stub returns 501)
  - [ ] "Based on data from X days" and "Last updated X ago" notices are both visible in the header
  - [ ] Panel closes via the close button
  - [ ] Panel closes via the Escape key
  - [ ] The country polygon stays highlighted while the panel is open; highlight clears when panel closes

  **URL and navigation**
  - [ ] Opening the panel adds `?country=<alpha2>` to the URL
  - [ ] Closing the panel removes the `country` param from the URL
  - [ ] Press browser Back after opening the panel → panel closes, URL returns to `?category=<slug>`
  - [ ] Load the page with `?country=ES` in the URL → panel opens automatically for Spain
  - [ ] Load the page with `?country=INVALID` → panel does not open, map loads normally

  **Mutual exclusion (⚠️ test this carefully)**
  - [ ] Open a channel-pin sidebar (click any pin) → then click a country polygon → channel sidebar closes, country panel opens, polygon highlight updates correctly
  - [ ] Open the country panel → then click a channel pin → country panel closes, channel sidebar opens, polygon highlight updates correctly
  - [ ] No flash of polygon deselection when switching between the two panels

  **N channel setting**
  - [ ] Open MapSettings → the channel count control is visible and labelled correctly
  - [ ] Change N → the setting persists across page reload

  **Category change**
  - [ ] With the country panel open, switch category → panel re-fetches with new category slug

  **Regression**
  - [ ] Channel-pin `InfoSidebar` still opens and displays correctly (no regression)
  - [ ] Category list still loads correctly
  - [ ] Map data still loads correctly (new API URL `/api/trending` works)
