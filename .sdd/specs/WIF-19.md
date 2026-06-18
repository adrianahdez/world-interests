---
spec_id: WIF-19
spec_type: feature
spec_title: Realtime Country Modal And Live Clock
branch: feature/WIF-19-Realtime-Country-Modal-And-Live-Clock
source: local
source_ref: null
---

# Spec: Realtime Country Modal And Live Clock

## Context / Background
The app's stated focus is real-time trending content, but the UI surfaces historical data first. Clicking a country polygon opens the country modal, which immediately shows all-time historical rankings (#1, #2, #3 …) with "Category", "Based on data from X days", and "Last updated today/…" labels. The only signal that the app is live is small footer text ("Youtube channels trending #1 now (realtime)"), which most users miss.

This spec rebalances the UI toward real-time. Two independent deliverables:

1. **Live clock label** (build first — simpler, no backend): a fixed label centered at the top of the screen showing current date + time (HH:MM:SS), updating every second, to make the live nature of the app obvious.
2. **Country modal redesign**: split the modal into two tabs — a new real-time "today only" tab (default/active) and the existing historical view moved verbatim into a second tab.

## Summary
Add a persistent top-center live clock styled identically to the existing map overlay labels, displaying the user's local date/time to the second with a timezone label. Redesign the country modal into a tabbed interface: a header with the country name, then two tabs. Tab 1 (default) shows today-only real-time rankings with a "Category" label, a live-updating "Updated:" wall-clock timestamp, and a "Showing X of up to Y channels" notice driven by a new dedicated setting. Tab 2 holds the current historical view, moved as-is with no functional change.

## Functional Requirements

### A. Live clock label
- A new fixed label appears horizontally centered at the top of the viewport at all times.
- It reuses the exact styling of the existing bottom overlay labels (`.map-overlay-label` family).
- Content: current date plus current time including hours, minutes, and seconds, updating in real time (per second).
- Time shown in the user's local timezone, with an explicit timezone label/abbreviation so it is unambiguous.
- Bilingual (EN/ES) and theme-aware (dark/light), consistent with existing labels.

### B. Country modal — structure
- On polygon click the modal opens with: a header showing the country name, then two tabs below it.
- Tab 1 = "Today" / real-time (default active). Tab 2 = "Historical".
- The country-name header is shared across both tabs (shown once, above the tabs).
- Switching tabs does not close or reload the modal.

### C. Country modal — Tab 1 (real-time / today)
- Displays current trending videos for TODAY only, ranked #1, #2, #3 … in real time.
- Keeps the existing `"Category: <name>"` label.
- Replaces the `"Updated today"` label with `"Updated: <timestamp>"` where the timestamp is a live wall-clock value updating in real time (per second), user's local timezone with tz label. This is a freshness/liveness cue, not the backend capture time.
- Removes the `"Based on data from …"` label from this tab (does not apply to real-time data).
- Shows the `"Showing X of up to Y channels (according to your settings)"` notice, where Y comes from a NEW dedicated real-time channel-count setting (see E), not the historical `countryChannels` setting.

### D. Country modal — Tab 2 (historical)
- Contains everything the modal shows today regarding historical data, exactly as it works now (channel cards, ranks, appearances tooltip, peak video, stats, "Based on data", "Last updated", "Showing X of up to Y" historical notice).
- No functional changes — existing implementation moved into this tab.
- Continues to use the existing `countryChannels` historical setting.

### E. New real-time channel-count setting
- Add a new setting in the settings page controlling how many channels the real-time tab shows.
- Separate from the historical `countryChannels` setting (rationale: the two tabs are conceptually different lists; users may want different limits, and coupling them is misleading).
- Follows existing settings conventions: visibility flag (`SETTING_*_VISIBLE`), localStorage persistence, stepper UI with min/max, bilingual label.

## Non-Goals / Out of Scope
- No change to historical data behavior, queries, or layout beyond relocating it into Tab 2.
- No redesign of map markers, sidebar, categories, or footer (footer's existing realtime text stays).
- No change to the historical `countryChannels` setting semantics.
- The "Updated:" timestamp is NOT a backend data-freshness indicator; it is a live wall clock.

## Possible Edge Cases
- Real-time "today" data empty for a country (early in the day, low-data region): tab must show a graceful empty/coming-soon state like the historical view does.
- Real-time data fewer than the configured Y channels: "Showing X of up to Y" must read correctly (X < Y).
- Modal open across midnight: "today" boundary shifts — define whether data and clock roll over while the modal is open.
- Live clock and "Updated:" timestamp must not drift or leak timers (cleanup on unmount; pause when tab/document hidden is optional).
- Timezone/DST: local time + tz label must remain correct across DST transitions.
- Tab state when switching country or category while the modal is open: define whether it resets to Tab 1.
- Top-center clock overlapping existing top-of-screen UI (header, controls) on small/mobile viewports.
- Loading/error/retry states for the real-time fetch (mirror historical tab states).
- "Today" definition timezone: server-day vs user-local-day mismatch could show an empty or stale list.

## Acceptance Criteria
- A fixed, horizontally-centered top label shows local date + HH:MM:SS, ticking every second with a tz label, styled identically to existing overlay labels, in both languages and both themes.
- Clicking a country polygon opens a modal with a country-name header and two tabs; Tab 1 (real-time) is active by default.
- Tab 1 shows today-only ranked results (#1, #2 …), the "Category" label, a live-updating "Updated: <time>" label, NO "Based on data" label, and a "Showing X of up to Y channels" notice reading from the new setting.
- Tab 2 shows the current historical view with no functional change, using the existing historical setting.
- The new real-time channel-count setting appears in settings, persists, and changes the Y value in Tab 1's notice.
- No timer leaks; clock and timestamp stop on modal/component unmount.

## Open Questions
- **Backend (must investigate `/home/adriana/PROYECTOS/world-interests-backend`):** Does the backend already capture per-day "today only" current rankings, or must this spec add a new collection pipeline in addition to a new endpoint? Determines real scope. Resolve during `/spec-plan` by inspecting the backend repo.
- Should Tab 1 auto-refresh its data on an interval while the modal is open (true real-time), or fetch once on open with only the clock ticking? "In real time" suggests polling — confirm interval and cost.
- What is the canonical definition of "today" — server timezone day, UTC day, or user-local day? Affects which captures the endpoint returns.
- When switching country/category with the modal open, does the active tab reset to Tab 1?
- Default value and min/max for the new real-time channel-count setting (mirror historical 1–10?).
- Tab labels' exact wording in EN/ES (e.g. "Today" / "Hoy", "Historical" / "Histórico").

## Dependencies
- Backend repo `world-interests-backend` (private) — likely a new endpoint, possibly new data collection, for today-only rankings. Frontend consumes via the existing PHP API pattern (`get-json.php?...`).
- SQLite database: `world-interests-backend/storage/worldinterests.db` — read directly (e.g. `sqlite3`) to inspect snapshot data while implementing.

## Success Metrics
- Increased perception/recognition that data is live (qualitative; optional analytics on real-time tab engagement vs historical).

## Testing Guidelines
- No automated test framework configured (per CLAUDE.md). Verify manually in the dev container (watch mode + HMR):
  - Live clock renders centered top, ticks per second, correct local time + tz, both themes/languages.
  - Modal opens to Tab 1; tab switching works without reload; header shared.
  - Tab 1 labels: Category present, "Updated:" ticking, "Based on data" absent, channel notice reads new setting.
  - Tab 2 identical to current historical behavior.
  - New setting persists across reload and updates Tab 1's Y value.
  - Empty/loading/error states on Tab 1.
  - No console timer-leak warnings after closing modal repeatedly.
- Backend (`world-interests-backend`): no test framework. Verify with `docker exec worldinterests_backend php public/cron.php` (or `index.php` to avoid quota), then curl `/api/country/today?country=ES&category=music&limit=10` and confirm ranked rows + that `/api/trending` payload still holds 1 video/region.

---

## Clarifications
<!-- User's answers to open questions and decisions -->

**Backend investigation (resolved during planning):**
- `/api/trending?category=<slug>` already serves the latest snapshot, but the cron fetches only the **single** most popular video per region (`get_videos(..., 1)` in `YoutubeTrendingService`). The Map consumes this file and uses only `data[alpha2][0]`.
- The `trend_snapshots` table stores one row per (category, country, video, captured_at) and has **no rank/position column**.
- `/api/country/history` is DB-backed via `TrendingHistoryRepo` + `useCountryHistory` hook — the pattern the real-time feature will mirror.

**Decisions from user (all recommended options accepted):**
1. **Data source** → New DB-backed endpoint `/api/country/today`. Cron stores top-N per region in snapshots (add `position` column); new `useCountryToday` hook mirrors `useCountryHistory`. The Map's `/api/trending` JSON stays at 1 video/region so map payload is unchanged.
2. **Refresh** → No polling. Real-time tab fetches once on open; only the wall-clock label ticks per second.
3. **"Today" definition** → Latest snapshot batch (most recent `captured_at` for that country/category), not a calendar-day filter. Avoids timezone issues; matches "real-time = current".
4. **New setting** → Mirror historical: default 10, max 20. Cron fetches up to 20 videos/region (YouTube `mostPopular` allows ≤50 at the same quota cost).

**Minor decisions (set by analyst, no functional ambiguity):**
- Modal always opens with the real-time tab active; tab state is local to the modal and resets to real-time when the selected country changes.
- Tab labels via translations: EN "Real-time" / "Historical", ES "En vivo" / "Histórico" (final wording confirmable at build).
- New endpoint name: `/api/country/today`. New setting key: `realtimeChannels`.

**Storage-model refinement (2026-06-18, during build of step 3):**
Debated whether top-N should live in `trend_snapshots` (one table) or a separate table. Chosen: **single table** (`trend_snapshots` + `position`), accumulating the full top-N history. Rationale:
- Single source of truth — a future "historical top-N" feature reads one table; a separate table would fragment the ranking (#1 vs #2..#N split) or duplicate the #1 time-series entirely.
- The only cost is adding a `position = 0 OR position IS NULL` filter to the existing history query to preserve "#1-only" semantics. This is provably output-identical (legacy rows are `NULL`, new #1 is `position 0`, #2..#N excluded) and verified by diffing the history endpoint before/after.
- **Partial index** removes the 20× volume concern for the history query:
  `CREATE INDEX idx_..._top1 ON trend_snapshots(country_id, category_id, captured_at) WHERE position = 0 OR position IS NULL` — SQLite indexes only the #1 rows, so the history query touches the same row count as today.
- `position` stores YouTube's `mostPopular` algorithmic order (array index), NOT a `view_count` re-sort — documented inline on the column.
- The map's `response-<slug>.json` and `/api/trending` stay at the #1 per region (unchanged). Top-N lives only in the DB.

## Analysis

### Affected Files

**Frontend — new files:**
- `src/LiveClock/LiveClock.jsx` + `src/LiveClock/LiveClock.scss` — fixed top-center ticking clock label.
- `src/hooks/useCountryToday.js` — fetch hook for `/api/country/today` (mirrors `useCountryHistory`).

**Frontend — modified:**
- `src/config.js` — add `STORAGE_KEY_REALTIME_CHANNELS`, `REALTIME_CHANNELS_DEFAULT` (10), `REALTIME_CHANNELS_MAX` (20).
- `src/settingsVisibility.js` — add `SETTING_REALTIME_CHANNELS_VISIBLE`.
- `src/App/App.jsx` — `realtimeChannels` state + handler + localStorage; pass through `CountryPanelContext` and to `Map`; render `<LiveClock>`.
- `src/Map/Map.jsx` — thread `realtimeChannels` / `onRealtimeChannelsChange` props to `MapSettings`.
- `src/Map/MapSettings/MapSettings.jsx` — new stepper block guarded by `SETTING_REALTIME_CHANNELS_VISIBLE`.
- `src/CountryPanel/CountryPanel.jsx` — split into shared header + two tabs; Tab 2 = current historical body moved verbatim; Tab 1 = new real-time view with live "Updated:" label, Category label, channel-count notice from new setting, ranked video cards, loading/empty/error states.
- `src/CountryPanel/CountryPanel.scss` — tab bar styles.
- `src/Common/translations.js` — tab labels, "Real-time" updated/timestamp label, `realtimeChannelsLabel`, tz/date formatting strings (EN/ES).

**Backend (`world-interests-backend`) — modified/new:**
- `src/Repositories/Database.php` — add nullable `position INTEGER` column to `trend_snapshots` (idempotent migration) + a **partial index** on `(country_id, category_id, captured_at) WHERE position = 0 OR position IS NULL` so the history query stays as fast as today despite 20× rows. Inline comment: the table now stores the ranked top-N per country/category over time; `position` is YouTube's `mostPopular` order (0 = #1), not a `view_count` sort.
- `src/Services/YoutubeTrendingService.php` — fetch top-N (20) per region instead of 1; `parse_popular_videos` already returns an array.
- `src/Services/TrendingCollectorService.php` (or `JsonWriterService` call site) — write only the #1 per region to `response-<slug>.json` (preserve current map payload) while persisting all N rows to the DB with a single shared `captured_at` per run.
- `src/Repositories/TrendingSnapshotRepo.php` — insert all N snapshot rows per region with `position` (0-based index from the ranked list), shared `captured_at`.
- `src/Repositories/TrendingHistoryRepo.php` — (a) add `position = 0 OR position IS NULL` filter to the existing `getCountryHistory` so "#1-only" semantics are preserved; (b) new `getCountryToday(country, category, limit)`: latest `captured_at` batch for that country/category, ordered by `position`, limited.
- `src/Controllers/CountryTodayController.php` — new HTTP handler (mirror `CountryHistoryController`).
- `public/index.php` — route `GET /api/country/today`.

### Risks & Concerns
- **Map payload regression** — if the cron writes top-N to `response-<slug>.json`, the map fetch balloons ~20×. Mitigation: write only `[0]` per region to the JSON; full list goes to the DB only.
- **Snapshot row volume** — storing 20 rows/region/category/run vs 1 grows `trend_snapshots` ~20×. Acceptable for SQLite at this scale (≈6.8k rows over the project's life today). History-query performance protected by the **partial index** on the `position = 0 OR position IS NULL` slice, so it touches the same row count as today.
- **History semantics change** — the history query now reads a table holding #1..#N, so it MUST filter `position = 0 OR position IS NULL` to keep counting "#1 only". Mitigation: legacy rows are `NULL` (preserved), new #1 is `position 0`; verify output is identical by diffing `/api/country/history` before/after on real data.
- **Docker rebuild required** — new backend classes (`CountryTodayController`) and `composer` classmap autoload mean the image must be rebuilt (`docker compose -f compose.dev.yml up --build -d`) before the container sees them (per backend CLAUDE.md).
- **Rank fidelity** — YouTube `mostPopular` order is the trending rank; persist array index as `position` rather than re-sorting by `view_count` (which would distort rank). Existing rows have `position = NULL`; `getCountryToday` must tolerate nulls (order by `position` then fallback).
- **`/api/country/history` unaffected** — verify the new multi-row snapshots don't change history aggregation results (history counts distinct days / channels; more rows per day for the same channel must not inflate `appearances`). Mitigation: confirm history query dedupes by channel+date.
- **Timer leaks** — both the live clock and the modal "Updated:" label use per-second intervals; must clear on unmount.
- **Top-center clock overlap** — fixed top-center label may collide with header/controls on mobile. Mitigation: responsive offsets, test ≤768px.
- **No automated tests** — all verification manual per CLAUDE.md.

### Decisions
- Real-time data is DB-backed and on-demand per country (not bundled into the map payload), keeping the map fast and following the established `/api/country/history` pattern.
- Top-N stored in a single `trend_snapshots` table with a `position` column (not a separate table); history query gets a partial-index-backed `position = 0 OR position IS NULL` filter. See the storage-model refinement in Clarifications for the full rationale.
- "Today" = latest snapshot batch, not a calendar filter — simplest correct definition for "current trending".
- "Updated:" timestamp is a client wall clock (liveness cue), explicitly not data freshness (per spec non-goal).
- Real-time channel-count is a separate setting from historical (`realtimeChannels`), mirroring historical defaults (10 / max 20).
- Build order: front-end-only live clock first (no backend dependency), then settings, then backend data pipeline, then the modal tabs that consume it.

## Implementation Plan
<!-- Ordered steps. Each step = one atomic, committable unit. -->
- [x] Step 1: Add the live clock label component — `src/LiveClock/LiveClock.jsx` + `.scss`, fixed top-center, reusing `.map-overlay-label` styling; renders local date + HH:MM:SS + tz abbreviation via `Intl`, ticking per second with interval cleanup; theme-aware and bilingual. Render it from `src/App/App.jsx`. Add any needed strings to `src/Common/translations.js`.
- [x] Step 2: Add the new real-time channel-count setting plumbing — `STORAGE_KEY_REALTIME_CHANNELS` / `REALTIME_CHANNELS_DEFAULT` (10) / `REALTIME_CHANNELS_MAX` (20) in `src/config.js`; `SETTING_REALTIME_CHANNELS_VISIBLE` in `src/settingsVisibility.js`; `realtimeChannels` state + handler + localStorage in `src/App/App.jsx`, exposed via `CountryPanelContext` and threaded through `src/Map/Map.jsx`; stepper block + label in `src/Map/MapSettings/MapSettings.jsx` and `realtimeChannelsLabel` in translations.
- [x] Step 3 (backend): In `src/Repositories/Database.php` add the idempotent `position INTEGER` (nullable) column to `trend_snapshots` + a partial index `(country_id, category_id, captured_at) WHERE position = 0 OR position IS NULL`. Add inline comments: the table stores the ranked top-N per country/category over time, `position` is YouTube's `mostPopular` order (0 = #1), not a `view_count` sort.
- [x] Step 4 (backend): In `src/Services/YoutubeTrendingService.php` fetch top-N (20) per region; persist all N rows per region with 0-based `position` and a single shared `captured_at` per run via `src/Repositories/TrendingSnapshotRepo.php`; ensure the `response-<slug>.json` written for the map keeps only the #1 video per region. Verify `/api/trending` payload unchanged.
- [x] Step 5 (backend): Add the `position = 0 OR position IS NULL` filter to the existing `getCountryHistory` in `src/Repositories/TrendingHistoryRepo.php` and verify `/api/country/history` output is identical to before (diff on real data); add `getCountryToday(country, category, limit)` (latest `captured_at` batch for the country/category, ordered by `position`, limited); add `src/Controllers/CountryTodayController.php` mirroring `CountryHistoryController`; route `GET /api/country/today` in `public/index.php`. Rebuild the Docker image and verify both endpoints with curl.
- [x] Step 6 (frontend): Add `src/hooks/useCountryToday.js` calling `/api/country/today?country=&category=&limit=`, mirroring `useCountryHistory` (loading / empty / 501 / error / abort-on-change semantics).
- [x] Step 7 (frontend): Refactor `src/CountryPanel/CountryPanel.jsx` into a tabbed layout — shared country-name header above a two-tab bar; move the entire existing historical body verbatim into Tab 2 (no functional change, still uses `countryChannels`); add tab state defaulting to the real-time tab and resetting on country change. Add tab-bar styles to `src/CountryPanel/CountryPanel.scss` and tab labels to translations.
- [ ] Step 8 (frontend): Implement Tab 1 (real-time) content — consume `useCountryToday` with `realtimeChannels`; render ranked video cards (#1..#N), the `"Category: <name>"` label, a live-updating `"Updated: <local time> <tz>"` label (per-second interval with cleanup), NO "Based on data" label, and the `"Showing X of up to Y channels"` notice reading `realtimeChannels`; include loading / empty / error+retry states mirroring the historical tab.
- [ ] Step 9: Manual QA per CLAUDE.md Testing Guidelines (frontend in the watch-mode dev container; backend via cron + curl). Confirm no timer leaks, both themes/languages, mobile layout for the top-center clock, and that historical Tab 2 + `/api/trending` + `/api/country/history` are unchanged.
