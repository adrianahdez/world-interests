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

**Icono ⓘ de información en tab Histórico (2026-06-19).**
- Posición: a la derecha de los botones del sub-toggle (misma fila, `country-panel__subtabs`).
- Texto: cambia según el modo activo (Vídeos / Canales) — más preciso que un texto fijo para ambos.
- Aplica solo a la tab Histórico; la tab En vivo no lo necesita (YouTube decide el orden, no hay criterio explicable).
- Implementación: nuevo componente genérico `InfoTooltip` (hover/focus, mismo patrón que `AppearancesTooltip`). Nuevo icono `IconInfo` SVG en `Icons.jsx`. Texto bilingüe en `translations.js`.

**Historical split into Videos + Channels (2026-06-19, #4).**
Clarified that `trend_snapshots` stores VIDEOS (one row per video per capture) but the Historical tab aggregates them to CHANNELS (`GROUP BY ch.id`) — e.g. ПРЕМИЯ ДАРВИНА was #1 with 9 distinct videos but shows as one channel. The user wants BOTH lists, keeping the channel-aggregation work but giving the #1 VIDEOS more prominence. Chosen UI = **Variant 2** (2 tabs + sub-toggle):
- Top level stays 2 tabs: **En vivo** (real-time videos) | **Histórico**.
- Inside Histórico, a segmented sub-toggle **[Vídeos | Canales]**, default **Vídeos**.
- **Histórico → Vídeos**: each #1 video over time (grouped by video), ranked by distinct days at #1 (tiebreak peak views); card shows thumbnail + title + channel + stats + "X días #1".
- **Histórico → Canales**: each channel that held #1, ranked by distinct days at #1; **compact rows (avatar + name + "X días #1"), NO featured video** (per user — drop the peak-video entirely).
- Resolves earlier label questions: the historical "Vídeo más visto"/peak-video label is removed (no featured video now); the real-time "Vídeo en tendencia" label is also removed (the #x rank badge already conveys it).
- Backend: the per-channel peak-video (`peaks` CTE) is removed; add a videos-grouped query; `/api/country/history` gains a `mode=videos|channels` param.

**Conceptual-data audit (2026-06-18, #3): fold/queue fixes for data-meaning bugs found across the app.**
Triggered by the ordering bug — swept the app for the same class of error. Findings + dispositions:
- **#1a `appearances` counted captures, not days** (CONFIRMED: JayWheelerVEVO `COUNT(rows)=5` vs distinct days `=3`; cron runs 2×/day). The UI says "different days" and the tooltip lists DISTINCT dates, so the number contradicted its own tooltip. → Folded into **Step 11**: `appearances = COUNT(DISTINCT DATE(captured_at))`.
- **#1b appearance-date tooltip range reversed** (CONFIRMED in `groupAppearanceDates.formatRange`): dates are newest-first, so a run renders `start(newest) – end(oldest)` = "17 abr – 15 abr" instead of "15 abr – 17 abr". Days are correct (16th is inside the range); only the endpoint order is wrong. → **Step 14**.
- **#2 map "🏆 Worldwide #1" uses max cumulative views, not trending** (CONFIRMED `Map.jsx:395`). There is no global-trending endpoint in the YouTube API (mostPopular is per-region); the honest proxy is **breadth — the video that is #1 in the most countries right now** (mode of the per-region #1s in the already-loaded `data`). Also the current label is just "🏆 <name>" (no "Worldwide #1:"). → **Step 15**: switch criterion to breadth + add "Worldwide #1:" prefix on desktop only (mobile unchanged to save space).
- **#3 category not in a region → wrong channels** (NOT a bug now): verified `BO` in `nonprofits-activism` is `[]`, so the front shows no pin. Correct as-is; no fix.
- **#4 ES/EN category divergence** (NOT a bug — verified, no fix): `categories.json` has identical slug sets for en and es (13/13). `CategorySyncService` derives canonical slugs from the English category titles/IDs and maps the Spanish names onto those same slugs, so en/es always share keys by construction. The picker showing the same categories in both languages is correct and guaranteed. The old backend TODO about a missing ES category is stale. No step.
- **#5 `total_views` summed cumulative views** (no leak): it is NOT in the payload — only an internal SELECT column used by the unused `getCountryHistory` ordering. → kept, commented in Step 11. No separate step.
- **#6 `favorite_count` always 0, unused in the front** (CONFIRMED: 0 frontend refs; collected/stored/written-to-JSON/selected in `getHistory`). → **Step 17**: remove from collection, storage, queries, and JSON; drop the column if SQLite supports it.
- **#7 `view_count` is lifetime-cumulative** (informational, not a bug): correctly displayed as "views"; used for cards, pin scaling, peak-video pick. No removal — just be aware any future "growth/velocity" metric needs deltas, not this counter.

**Re-plan (2026-06-18, #2): backfill `position` NULL→0, and rename the panel title.**
- **Backfill `position`:** legacy rows were left `NULL` by the `ADD COLUMN` migration, but they ARE the #1 (the old cron only stored the #1). NULL has no semantic value here. Decision: idempotent `UPDATE trend_snapshots SET position = 0 WHERE position IS NULL` in `initSchema`, then **simplify every `(position = 0 OR position IS NULL)` filter to `position = 0`** (queries + partial index). The cron always inserts an explicit `position`, so no new NULLs appear. This revisits steps 3 & 5 (already committed) via new forward commits — no history rewrite.
- **Panel title:** both tabs show trending content, so the bare `{flag} {country}` header is renamed to **EN "Trending in {flag} {country}" / ES "Tendencias en {flag} {country}"** to orient the user. Reuse the now-orphaned `countryPanelTitlePrefix` key.
- Decided NOT to build views/likes/comments leaderboards: that data (derived only from trending #1s) is a biased sample and would mislead; trending stays the focus. `getCountryHistory` (views-ordered) is kept dormant only as cheap optionality.

**Re-plan (2026-06-18): change the historical tab's ordering criterion.**
Trigger: the historical tab orders channels by `total_views = SUM(view_count)`, which double-counts a video's cumulative views across the days it was #1 — unintuitive. Goal: order more consistently with the Today tab (strongest first).
- **YouTube `mostPopular` order is opaque and NOT reproducible** for the historical aggregate: it's an undocumented popularity blend (view velocity, engagement, recency — not raw views), and the historical rows are all #1 (`position = 0 OR NULL`), so there is no per-row rank to sort by. So we cannot order history "the same way YouTube does".
- **Decision — order by `appearances DESC`** (number of days the channel was #1), tiebreak by peak views (`MAX(view_count) DESC`). Closest in spirit to Today (most dominant first) and intuitive. `position = 0` and `position IS NULL` rows both count as #1 appearances (NULL = legacy pre-migration #1s), treated identically; `position >= 1` rows stay excluded.
- **Decision — keep `getCountryHistory` (the views-ordered method) but mark it unused**, for a possible future "by views" tab. Extract the shared query into a private helper with a parameterized `ORDER BY`; both `getCountryHistory` (unused) and the new method are thin wrappers. The controller switches to the new method. Minimal change = just the order criterion.

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

**Frontend — new files (2026-06-19, info tooltip):**
- `src/InfoTooltip/InfoTooltip.jsx` + `src/InfoTooltip/InfoTooltip.scss` — generic hover/focus info tooltip. Follows `AppearancesTooltip` pattern; takes a `text` prop.

**Frontend — new files:**
- `src/LiveClock/LiveClock.jsx` + `src/LiveClock/LiveClock.scss` — fixed top-center ticking clock label.
- `src/hooks/useCountryToday.js` — fetch hook for `/api/country/today` (mirrors `useCountryHistory`).

**Frontend — modified (2026-06-19, info tooltip):**
- `src/Common/Icons.jsx` — añadir `IconInfo` SVG (círculo con «i», mismo estilo que los iconos existentes).
- `src/Common/translations.js` — añadir `historicalInfoVideos` y `historicalInfoChannels` (EN + ES).
- `src/CountryPanel/CountryPanel.jsx` — importar `InfoTooltip` e `IconInfo`; colocar `<InfoTooltip>` a la derecha del sub-toggle en `HistoricalTab`, texto dependiente del `mode` activo.
- `src/CountryPanel/CountryPanel.scss` — alinear el icono a la derecha dentro de `country-panel__subtabs` (flexbox `space-between` o `margin-left: auto`).

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

**Backend — re-plan (2026-06-18, historical ordering):**
- `src/Repositories/TrendingHistoryRepo.php` — extract the `getCountryHistory` query into a private helper with a parameterized `ORDER BY`; `getCountryHistory` becomes a thin wrapper kept **unused** (commented, for a future "by views" tab); add a new method (e.g. `getCountryHistoryByAppearances`) ordering by `appearances DESC, MAX(view_count) DESC`. The helper's `ranked` CTE must expose the tiebreak column (`max_views`) and carry the order columns to the final `SELECT`.
- `src/Controllers/CountryHistoryController.php` — call the new appearances-ordered method instead of `getCountryHistory` (response shape unchanged).
- `src/Repositories/Database.php` — idempotent backfill `UPDATE … SET position = 0 WHERE position IS NULL`; replace the partial index predicate `WHERE position = 0 OR position IS NULL` with `WHERE position = 0` (drop old / create new, idempotently).
- All `(position = 0 OR position IS NULL)` filters (in `getCountryHistory`/the new helper, `getHistory`) simplified to `position = 0`.
- `src/CountryPanel/CountryPanel.jsx` + `src/Common/translations.js` — panel title → "Trending in {flag} {country}" / "Tendencias en {flag} {country}" (reuse `countryPanelTitlePrefix`).

**Frontend/backend — conceptual-data audit (2026-06-18 #3):**
- `src/Repositories/TrendingHistoryRepo.php` — `appearances = COUNT(DISTINCT DATE(captured_at))` (folded into Step 11).
- `src/CountryPanel/groupAppearanceDates.js` — render date ranges oldest→newest (Step 14).
- `src/Map/Map.jsx` (+ `src/Map/Countries/Countries.scss`, `src/Common/translations.js`) — worldwide-#1 by breadth (most countries) + "Worldwide #1:" desktop-only label (Step 15).
- Backend `YoutubeTrendingService.php`, `TrendingSnapshotRepo.php`, `TrendingHistoryRepo.php` (`getHistory`), `Database.php`, and the JSON output — remove `favorite_count` (Step 16).

### Risks & Concerns
- **Tooltip en móvil (2026-06-19)** — hover no funciona en touch. `AppearancesTooltip` usa el mismo patrón y tiene el mismo límite; es consistente no resolverlo aquí. Si se quiere toggle en tap, es trabajo futuro.
- **Desbordamiento del tooltip (2026-06-19)** — el panel es estrecho; el tooltip debe abrirse hacia arriba o hacia la izquierda para no salir del viewport. Controlar con CSS (`bottom: 100%`, `right: 0`).

- **Map payload regression** — if the cron writes top-N to `response-<slug>.json`, the map fetch balloons ~20×. Mitigation: write only `[0]` per region to the JSON; full list goes to the DB only.
- **Snapshot row volume** — storing 20 rows/region/category/run vs 1 grows `trend_snapshots` ~20×. Acceptable for SQLite at this scale (≈6.8k rows over the project's life today). History-query performance protected by the **partial index** on the `position = 0 OR position IS NULL` slice, so it touches the same row count as today.
- **History semantics change** — the history query now reads a table holding #1..#N, so it MUST filter `position = 0 OR position IS NULL` to keep counting "#1 only". Mitigation: legacy rows are `NULL` (preserved), new #1 is `position 0`; verify output is identical by diffing `/api/country/history` before/after on real data.
- **Docker rebuild required** — new backend classes (`CountryTodayController`) and `composer` classmap autoload mean the image must be rebuilt (`docker compose -f compose.dev.yml up --build -d`) before the container sees them (per backend CLAUDE.md).
- **Rank fidelity** — YouTube `mostPopular` order is the trending rank; persist array index as `position` rather than re-sorting by `view_count` (which would distort rank). Existing rows have `position = NULL`; `getCountryToday` must tolerate nulls (order by `position` then fallback).
- **`/api/country/history` unaffected** — verify the new multi-row snapshots don't change history aggregation results (history counts distinct days / channels; more rows per day for the same channel must not inflate `appearances`). Mitigation: confirm history query dedupes by channel+date.
- **Timer leaks** — both the live clock and the modal "Updated:" label use per-second intervals; must clear on unmount.
- **Top-center clock overlap** — fixed top-center label may collide with header/controls on mobile. Mitigation: responsive offsets, test ≤768px.
- **No automated tests** — all verification manual per CLAUDE.md.
- **Historical order changes for users (2026-06-18)** — the historical tab will reorder from "by total views" to "by times #1". Intended, but it is a visible behavior change; verify on a country with several historical channels.
- **Tie determinism (2026-06-18)** — with sparse data many channels share `appearances = 1`; without a tiebreak the order would be arbitrary. The `MAX(view_count) DESC` tiebreak makes it deterministic.
- **Dead code kept intentionally (2026-06-18)** — `getCountryHistory` becomes unused; confirm nothing else calls it (only `CountryHistoryController`, which is being switched; the legacy `get-history.php` uses the separate `getHistory`). Leave it with an "unused — kept for future by-views tab" comment.
- **Partial-index swap (2026-06-18 #2)** — changing the index predicate needs DROP + CREATE (CREATE INDEX IF NOT EXISTS won't alter an existing one). Use a new index name + `DROP INDEX IF EXISTS` on the old, so it stays idempotent without rebuilding every boot. Run the backfill `UPDATE` before/alongside so the `position = 0` predicate covers all #1 rows. Verify the history query still uses the partial index (`EXPLAIN QUERY PLAN`).
- **Backfill safety (2026-06-18 #2)** — `UPDATE … WHERE position IS NULL` is cheap (idempotent, matches 0 rows after first run; runs once per process boot, not per request). Low risk.

### Decisions
- Real-time data is DB-backed and on-demand per country (not bundled into the map payload), keeping the map fast and following the established `/api/country/history` pattern.
- Top-N stored in a single `trend_snapshots` table with a `position` column (not a separate table); history query gets a partial-index-backed `position = 0 OR position IS NULL` filter. See the storage-model refinement in Clarifications for the full rationale.
- Historical tab orders by `appearances DESC` (times at #1), tiebreak peak views — not by summed views, and not by YouTube's opaque `mostPopular` order (which isn't reproducible). Views-ordered method retained but unused for a future tab. See the 2026-06-18 re-plan entry in Clarifications.
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
- [x] Step 8 (frontend): Implement Tab 1 (real-time) content — consume `useCountryToday` with `realtimeChannels`; render ranked video cards (#1..#N), the `"Category: <name>"` label, a live-updating `"Updated: <local time> <tz>"` label (per-second interval with cleanup), NO "Based on data" label, and the `"Showing X of up to Y channels"` notice reading `realtimeChannels`; include loading / empty / error+retry states mirroring the historical tab.
- [x] Step 9: Manual QA per CLAUDE.md Testing Guidelines (frontend in the watch-mode dev container; backend via cron + curl). Confirm no timer leaks, both themes/languages, mobile layout for the top-center clock, and that historical Tab 2 + `/api/trending` + `/api/country/history` are unchanged.
- [x] Step 10 (backend): In `src/Repositories/Database.php`, add an idempotent backfill `UPDATE {$snapshots} SET position = 0 WHERE position IS NULL` (legacy #1 rows get an explicit rank), and replace the partial index with one predicated on `WHERE position = 0` — new index name + `DROP INDEX IF EXISTS` the old `idx_trend_snapshots_top1`, so it's idempotent without rebuilding each boot. Build this first of the new steps (later filters assume no NULLs remain).
- [x] Step 11 (backend): In `src/Repositories/TrendingHistoryRepo.php`, extract the `getCountryHistory` query into a private helper taking a parameterized `ORDER BY` (expose `max_views = MAX(view_count)` in the `ranked` CTE, carried to the final `SELECT`; filter simplified to `position = 0`). Turn `getCountryHistory` into a thin wrapper ordering by `total_views DESC`, commented as currently unused (kept for a future "by views" tab). Add a new method (e.g. `getCountryHistoryByAppearances`) ordering by `appearances DESC, max_views DESC`. Simplify the `getHistory` filter to `position = 0` too. Response shape unchanged. Point `src/Controllers/CountryHistoryController.php` at the new method.
- [x] Step 12 (backend): Rebuild the Docker image; verify the backfill (no `position IS NULL` rows remain), that `EXPLAIN QUERY PLAN` still uses the partial index, that `/api/country/history` returns channels ordered by times-at-#1 (curl a country with several historical channels), and that `getCountryToday`, `/api/trending`, and the Today tab are unaffected.
- [x] Step 13 (frontend): Rename the country panel title — reuse the orphaned `countryPanelTitlePrefix` in `src/Common/translations.js` (EN "Trending in" / ES "Tendencias en") and render it before `{flag} {countryName}` in `src/CountryPanel/CountryPanel.jsx`. Verify in the running app (both languages).
- [x] Step 14 (frontend, bug #1b): In `src/CountryPanel/groupAppearanceDates.js`, render consecutive-date ranges oldest→newest (currently `formatRange` prints newest `start` – oldest `end`, e.g. "17 abr – 15 abr"; should be "15 abr – 17 abr"). Single-date entries unchanged. Verify the tooltip in the app for a multi-day channel.
- [x] Step 15 (frontend, bug #2): In `src/Map/Map.jsx`, change `mostViewedPoint` from "highest view count" to **breadth** — the video that is the #1 (`data[region][0]`) in the most countries (mode of `idVideo` across regions; tiebreak by view count). Add a "Worldwide #1:" prefix to the 🏆 label **on desktop only** (mobile keeps "🏆 <name>" to save space) via a new translation key + a CSS-hidden span ≤768px (`src/Map/Countries/Countries.scss`, `src/Common/translations.js`). Verify the label/criterion in the app at desktop + mobile widths.
- [x] Step 16 (backend, bug #6): Remove `favorite_count`/`favoriteCount` from the data path — `YoutubeTrendingService` (stop parsing into the JSON `statistics`), `TrendingSnapshotRepo::insertTrending` (drop the column from the INSERT), `TrendingHistoryRepo::getHistory` (drop from SELECT), and the `Database` schema (drop the column if the container's SQLite ≥ 3.35 supports `DROP COLUMN`; otherwise leave it unused with a comment). Confirm the frontend never read it (it doesn't). Rebuild + verify `/api/trending` and the cron still work.
- [x] Step 17 (backend, historical split): In `src/Repositories/TrendingHistoryRepo.php`, add `getCountryHistoryVideos(country, category, limit)` — group by `video_id`, `appearances = COUNT(DISTINCT DATE(captured_at))` at `position = 0`, ordered `appearances DESC, MAX(view_count) DESC`, returning each video (youtube_id, title, view/like/comment via MAX) + its channel (youtube_id, title, image_url) + `appearance_dates`. Refactor the channel method to drop the `peaks` CTE / `peak_video` (channels = avatar+name+appearances+dates only); rename to `getCountryHistoryChannels`. Add a `mode` (`videos` default | `channels`) param to `CountryHistoryController` + `/api/country/history`, dispatching to the right method. Keep the dormant by-views ordering option. Rebuild + curl both modes.
- [x] Step 18 (frontend, historical split): Add a `mode` arg to `useCountryHistory` (videos|channels) or a sibling hook hitting `/api/country/history?mode=`. In `src/CountryPanel/CountryPanel.jsx`, add a segmented sub-toggle [Vídeos | Canales] inside the Historical tab (default Vídeos, resets with the tab/country); render the historical **videos** list (video card with thumbnail + channel + stats + "X días #1") and the historical **channels** list (compact avatar+name+"X días #1", no thumbnail). Remove the real-time "Vídeo en tendencia" label (`realtimeVideoLabel`) and the now-unused peak-video/"Vídeo más visto" rendering. Add sub-toggle styles (`CountryPanel.scss`) + translations (EN/ES). Keep the appearance-date tooltip on both lists.
- [x] Step 19 (frontend, UX): Make the tab strip read as interactive, not plain text labels. In `src/CountryPanel/CountryPanel.scss`, give the top tabs (Real-time / Historical) a clearer clickable affordance (e.g. subtle pill/background, border, or stronger hover + active state; keep `cursor: pointer`), and apply the same treatment to the Videos/Canales sub-toggle from Step 18 so it reads as a segmented control. Both themes; subtle, no clutter. Verify in the app.
- [x] Step 20: Manual QA per CLAUDE.md for the historical split — both sub-toggle lists (videos default, channels compact), tab/sub-toggle clickable affordance (Step 19), date tooltip order (Step 14), worldwide-#1 label (Step 15), no `favorite_count` regressions (Step 16), both languages/themes, mobile layout. Confirm real-time tab and `/api/trending` unaffected.
- [x] Paso 21 (bug visible para el usuario): En `src/Controllers/CountryHistoryController.php` cambiar el límite del histórico de `[1, 10]` (default 3) a `[1, 20]` (default 10), alineándolo con el endpoint Today y con `COUNTRY_CHANNELS_MAX = 20` del frontend. Sin este cambio, el aviso «Mostrando X de hasta Y canales» en el tab histórico mentía cuando el usuario configuraba más de 10.
- [x] Paso 22 (rendimiento): En `src/Repositories/Database.php`, bloquear el `UPDATE … SET position = 0 WHERE position IS NULL` y el swap de índice parcial tras `PRAGMA user_version`. Antes se ejecutaban en cada llamada a `getConnection()`, abriendo una transacción de escritura en cada petición de lectura a la API. Ahora se ejecutan una sola vez y se marca `PRAGMA user_version = 1`.
- [x] Paso 23 (robustez): En `src/Services/TrendingCollectorService.php`, cambiar la transacción de una por categoría a una por país. Un fallo en una fila ya no revierte el lote completo de la categoría; solo pierde ese país en esa ejecución del cron.
- [x] Paso 24 (invariante de esquema): En `src/Repositories/TrendingSnapshotRepo.php`, cambiar `?int $position = null` a `int $position` (requerido, no nullable) en `insertTrending`. Hace cumplir en PHP el invariante que el backfill garantiza en la BD: ninguna fila nueva tiene `position = NULL`.
- [x] Paso 25 (UX, parpadeo): En `src/CountryPanel/CountryPanel.jsx`, añadir `items.length > 0` a la guardia de éxito del tab histórico (línea del `!isLoading && !error && !isEmpty && data`). Evita pintar «Mostrando 0 de hasta N» durante el fotograma entre que se cambia el sub-toggle (Vídeos/Canales) y que el hook lanza la nueva petición.
- [x] Paso 26 (rendimiento): En `src/CountryPanel/CountryPanel.jsx`, extraer el reloj ticking del `RealtimeTab` a un componente hoja `LiveTimestamp`. Solo `LiveTimestamp` se re-renderiza en cada tick de un segundo; el mapeo de `VideoCard` sobre la lista completa ya no reconcilia cada segundo.
- [x] Paso 27 (claridad): En `src/Map/Map.jsx`, renombrar `mostViewedPoint` → `topCountriesPoint` y `handleMostViewedClick` → `handleTopCountriesClick`. El nombre anterior sugería un ranking por reproducciones; la lógica real elige el vídeo que está en #1 en más países (amplitud).
- [x] Paso 28 (reutilización + eficiencia): Extraer `src/hooks/useNow.js` — hook compartido que devuelve un `Date` que se actualiza cada segundo (un solo `useState` + `setInterval` + `clearInterval`). `LiveClock` y `LiveTimestamp` consumían el mismo patrón de forma independiente; ahora ambos usan `useNow()` eliminando la duplicación. Adicionalmente, los `Intl.DateTimeFormat` de ambos componentes se cachean con `useMemo` (keyed en `locale`) en lugar de reconstruirse en cada render/tick.
- [x] Paso 29 (simplificación backend): En `src/Services/TrendingCollectorService.php`, eliminar la variable `$country_db` que era un alias redundante de `$db` con un null-check siempre verdadero. Usar `$db->inTransaction()` directamente en el catch.
- [x] Paso 30 (robustez backend): En `src/Repositories/Database.php`, envolver el bloque de migración `user_version < 1` (backfill + swap de índice) en `beginTransaction`/`commit`. Sin esto, un fallo a mitad dejaba `user_version` en 0 pero las operaciones anteriores ya aplicadas, causando un reintento parcialmente redundante. Con la transacción, cualquier fallo revierte todo el bloque y el siguiente boot lo reintenta limpio.
- [x] Paso 31 (crítico — singleton roto en fallo de migración): En `src/Repositories/Database.php`, envolver el bloque `if ($schema_version < 1)` en un try/catch que, si cualquier `exec()` lanza, haga rollBack explícito y asigne `self::$connection = null` antes de re-throw. Sin esto, si la migración falla a mitad, `self::$connection` queda apuntando a una conexión con transacción abierta (ya fue asignado antes de llamar a `initSchema`); todas las llamadas posteriores a `getConnection()` en ese proceso devuelven esa conexión rota y fallan con "there is already an active transaction" hasta que el proceso muere. Con `self::$connection = null`, el siguiente caller reintenta la inicialización desde cero.
- [x] Paso 32 (alto — log de éxito falso positivo): En `src/Services/TrendingCollectorService.php`, añadir un contador `$fail_count` que se incrementa en el inner catch del bucle por-país. Tras el bucle, reemplazar el echo `✅` incondicional por: `✅` si `$fail_count === 0`, `⚠️` con ratio si fue fallo parcial, `❌` si fallaron todos los países. Actualmente el ✅ se imprime aunque cero países se hayan guardado, haciendo el log inútil para detectar problemas.
- [x] Paso 33 (medio — busy_timeout para race concurrente en migración): En `src/Repositories/Database.php`, añadir `$pdo->exec('PRAGMA busy_timeout = 3000')` justo después de configurar `ATTR_ERRMODE`. Sin esto, el default de SQLite es 0 ms — si dos workers de php-fpm arrancan simultáneamente y ambos entran en el bloque de migración, el segundo writer falla inmediatamente con "database is locked" en lugar de esperar los ~ms que tarde el primero en hacer commit. Con 3 s de timeout el segundo espera, ve `user_version = 1` al leer tras el lock, y omite la migración (todas las ops son idempotentes de todos modos).
- [x] Paso 34 (medio — backfill de thumbnail_url fuera del gate de versión): En `src/Repositories/Database.php`, el `UPDATE {$videos} SET thumbnail_url = ... WHERE thumbnail_url IS NULL` corre fuera del bloque `user_version < 1`, lo que provoca un full-table-scan en cada inicio de worker de php-fpm (el singleton garantiza una vez por proceso, no por request, pero sigue siendo innecesario en DBs ya migradas). Moverlo a un bloque `user_version < 2` nuevo (bumpeando `PRAGMA user_version = 2` al final), de modo que sólo corra una vez. Incluir en la transacción del nuevo bloque.
- [x] Paso 35 (medio — catch (Exception) no captura \Error en PHP 8): En `src/Services/TrendingCollectorService.php`, cambiar `catch (Exception $e)` a `catch (\Throwable $e)` en el inner try/catch del bucle por-país (línea 216). `\Error`, `\TypeError`, `\ValueError` extienden `\Throwable`, no `\Exception`; si cualquier callee lanza un `\Error`, el inner catch actual no lo intercepta, la transacción activa no hace rollBack, y el error escapa al outer catch (que también usa `Exception`) quedando sin manejar.
- [x] Paso 36 (bajo — fix en el hook en lugar del consumidor para el stale frame): En `src/hooks/useCountryRanking.js`, cambiar el `useEffect` de reset de estado (`setData(null)`, `setIsLoading(true)`, etc.) a `useLayoutEffect`. `useEffect` corre asíncronamente después del paint, lo que provoca un frame donde `data` tiene la respuesta anterior, `isEmpty` es `false` y `items = []` (el nuevo modo no tiene esa key). `useLayoutEffect` corre síncronamente antes del paint, eliminando ese frame. Una vez aplicado, eliminar el guard `&& items.length > 0` de la condición de éxito en `CountryPanel.jsx` (línea ~338) — ya no defiende ningún estado alcanzable.
- [x] Paso 37 (bajo — convención CLAUDE.md): Mover `LiveTimestamp` de su definición inline en `src/CountryPanel/CountryPanel.jsx` a `src/LiveTimestamp/LiveTimestamp.jsx`. CLAUDE.md: «Each component lives in its own folder with a colocated .scss file.» `LiveTimestamp` tiene propTypes y hooks; cumple la definición de componente propio. No necesita `.scss` propio (usa `country-panel__meta-item` de `CountryPanel.scss`), así que crear el archivo vacío o simplemente omitirlo. Actualizar el import en `CountryPanel.jsx`.
- [x] Paso 38 (backend — desempate por recencia en histórico de canales y vídeos): En `src/Repositories/TrendingHistoryRepo.php`, cambiar el desempate de `getCountryHistoryChannels` y `getCountryHistoryVideos` de vistas a `MAX(captured_at) DESC` (recencia). Razonamiento: dos entradas con los mismos días en #1 — la más reciente es más relevante para una app de tendencias. Para vídeos el argumento es aún más fuerte: son efímeros por naturaleza y `view_count` acumulado favorecería siempre a contenido antiguo sobre uno que acaba de explotar.
- [x] Paso 39 (frontend — icono info): En `src/Common/Icons.jsx`, añadir `IconInfo` — círculo SVG con letra «i» inscrita, mismo tamaño y estilo que `IconEye`/`IconThumbUp`/`IconComment`. Props: `className`.
- [x] Paso 40 (frontend — componente InfoTooltip): Crear `src/InfoTooltip/InfoTooltip.jsx` + `src/InfoTooltip/InfoTooltip.scss`. Sigue exactamente el patrón de `AppearancesTooltip` (hover/focus → visible, blur/leave → oculto, `role="tooltip"`, `useId`, `aria-describedby`). Props: `text` (string), `children` (el trigger). El tooltip se posiciona `bottom: 100%; right: 0` para no salir del panel por la derecha ni por debajo.
- [x] Paso 41 (frontend — traducciones): En `src/Common/translations.js`, añadir `historicalInfoVideos` y `historicalInfoChannels` en EN y ES. Texto EN — vídeos: «Ranked by distinct days at #1. Ties broken by most recent appearance.» Canales: «Channels ranked by distinct days at #1. Ties broken by most recent appearance.» Traducir al ES equivalente.
- [ ] Paso 42 (frontend — integración): En `src/CountryPanel/CountryPanel.jsx`, importar `InfoTooltip` e `IconInfo`. En `HistoricalTab`, añadir `<InfoTooltip text={mode === 'videos' ? tr.historicalInfoVideos : tr.historicalInfoChannels}><IconInfo /></InfoTooltip>` dentro de `country-panel__subtabs`, separado del tablist (no dentro del `role="tablist"` para no romper la accesibilidad). En `CountryPanel.scss`, hacer que el wrapper del sub-toggle use `display: flex; align-items: center; justify-content: space-between` para empujar el icono a la derecha.
- [ ] Paso 43: QA manual — verificar tooltip en ambas subtabs (Vídeos / Canales), ambos idiomas, ambos temas; confirmar que el texto cambia al alternar el modo; comprobar que no desborda el panel en pantallas estrechas; confirmar que `AppearancesTooltip` existente no se ve afectado. En `src/Repositories/TrendingHistoryRepo.php`, cambiar el desempate de `getCountryHistoryChannels` y `getCountryHistoryVideos` de vistas a `MAX(captured_at) DESC` (recencia). Razonamiento: dos entradas con los mismos días en #1 — la más reciente es más relevante para una app de tendencias. Para vídeos el argumento es aún más fuerte: son efímeros por naturaleza y `view_count` acumulado favorecería siempre a contenido antiguo sobre uno que acaba de explotar.
