# Spec for Tooltip With Date Ranges For Channel History Appearances

branch: feature/WIF-11-Tooltip-With-Date-Ranges-For-Channel-History-Appearances

## Summary

Currently, the country panel shows a line like "Channel: 2 days as #3 in data history" but gives no detail about *when* those days occurred. This feature adds a tooltip on that line revealing the specific dates, using range compression for consecutive days (e.g. "Mar 3–5, Apr 12") and a "+N more" overflow cap so the tooltip stays readable as history grows.

## Functional Requirements

- Hovering the "X days as #Y in data history" text shows a tooltip listing the dates when the channel held that position.
- Consecutive days (with no gap) are collapsed into a single range (e.g. "Mar 3–5"). Non-consecutive days are listed individually.
- Only strictly consecutive dates collapse — a gap of even one day keeps entries separate.
- The tooltip displays at most 3–5 entries (individual dates or ranges). If more exist, append "… and N more" where N is the remaining count of individual dates not shown.
- Dates are formatted consistently with the app's active language (EN/ES).
- The tooltip is accessible via keyboard focus as well as mouse hover.

## Possible Edge Cases

- Channel has only 1 day of history: tooltip shows a single date, no range logic needed.
- All days are consecutive: the entire history collapses into one range, no overflow needed.
- All days are non-consecutive and exceed the cap: show the 3–5 oldest or most recent (define which) plus "+N more".
- The date data is missing or malformed for some entries: those entries should be skipped gracefully without breaking the tooltip.
- Very long date ranges spanning multiple months or years: the range format must remain concise (e.g. "Dec 30 – Jan 2" rather than expanding).

## Acceptance Criteria

- The tooltip appears on hover/focus of the history appearances line.
- Consecutive dates are correctly merged into ranges; non-consecutive dates remain separate.
- The cap limits visible entries to 3–5, with an accurate "+N more" suffix when overflow exists.
- The tooltip renders correctly in both English and Spanish.
- The tooltip does not appear when there are zero days of history data.
- No layout shift or overflow in the country panel when the tooltip is shown.

## Open Questions

- Should the capped entries show the most recent or the earliest dates first?
- What is the exact cap number — 3, 4, or 5 entries?
- Is the date data already available in the API response for each channel, or does it need to be added?

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- Date grouping utility: single date, all consecutive, all non-consecutive, mixed.
- Overflow: exactly at cap, one over cap, many over cap.
- Edge: missing/malformed dates, single-entry history.

## Clarifications

- Cap: 4 entries (individual dates or ranges) shown; remaining collapsed into "+ N more".
- Order: most recent dates/ranges first.
- Backend: include `appearance_dates` field in `getCountryHistory` response — confirmed safe, purely additive.
- Tooltip: custom React component with hover + keyboard-focus support.

## Analysis

### Affected Files

**Backend (`/home/adriana/PROYECTOS/world-interests-backend`)**
- `src/Repositories/TrendingHistoryRepo.php` — add `GROUP_CONCAT` for dates in `ranked` CTE, expose `appearance_dates` in response array.

**Frontend (`/home/adriana/PROYECTOS/world-interests`)**
- `src/CountryPanel/CountryPanel.jsx` — wrap appearances line in `<AppearancesTooltip>`, pass `appearance_dates`.
- `src/CountryPanel/CountryPanel.scss` — add tooltip styles (dark/light theme, positioning).
- `src/Common/translations.js` — add `andMore` key (EN: "+ {n} more", ES: "+ {n} más").

**New files**
- `src/CountryPanel/AppearancesTooltip.jsx` — tooltip component: groups dates into consecutive ranges, caps at 4, renders "+N more".
- `src/CountryPanel/groupAppearanceDates.js` — pure utility: takes a `string[]` of ISO dates, returns a capped+formatted array of display strings.

### Risks & Concerns

- **Backend GROUP_CONCAT length**: MySQL's default `group_concat_max_len` is 1024 bytes. At ~10 bytes per date ("2026-01-15,"), a channel with 100+ distinct appearance days could hit the limit and return a truncated string. Mitigation: guard against this in the frontend parser (treat malformed/short dates as skippable), and note the limit in a backend comment.
- **No breaking change to existing consumers**: confirmed — `appearance_dates` is additive; all existing frontend code ignores unknown fields.
- **Cross-year ranges**: "Dec 30 – Jan 2" needs the year included if the two dates span different years, otherwise it's ambiguous. The formatting utility must detect year changes within a range.

### Decisions

- Pure utility function (`groupAppearanceDates.js`) kept separate from the component so it is easy to test in isolation.
- CSS tooltip (no third-party library) — consistent with the app's zero-dependency UI style.
- `GROUP_CONCAT(DISTINCT DATE(...) ORDER BY ... DESC)` — descending so the PHP `explode` already yields newest-first, matching the display order requirement without a frontend sort.

## Implementation Plan

- [x] Step 1 — **Backend**: in `TrendingHistoryRepo.php`, add `GROUP_CONCAT(DISTINCT DATE(sn.captured_at) ORDER BY sn.captured_at DESC) AS appearance_dates` to the `ranked` CTE and `r.appearance_dates` to the final SELECT; expose as `'appearance_dates' => $row['appearance_dates'] ? explode(',', $row['appearance_dates']) : []` in the channel array; update the docblock.
- [x] Step 2 — **Utility**: create `src/CountryPanel/groupAppearanceDates.js` — pure function that accepts `string[]` of ISO date strings (newest-first), groups strictly consecutive runs into ranges, caps output at 4 entries, and returns `{ entries: string[], overflow: number }`. Handle missing/malformed dates by skipping them. Include year in range endpoints only when they differ.
- [x] Step 3 — **Component**: create `src/CountryPanel/AppearancesTooltip.jsx` — wraps the appearances text in a `<span>` with `tabIndex={0}`; on hover/focus renders a positioned tooltip `<div role="tooltip">` listing entries and "+ N more" suffix; uses `isEs` from `LanguageContext` to format dates and the `andMore` translation key.
- [x] Step 4 — **Styles**: add `.channel-card__appearances-tooltip` styles to `CountryPanel.scss` — absolute positioning relative to the appearances span, dark/light theme variants, z-index safe above card content, visible on `:hover` / `:focus-within`.
- [x] Step 5 — **Translations**: add `andMore` to both EN and ES in `translations.js`; wire `AppearancesTooltip` into `ChannelCard` in `CountryPanel.jsx`, passing `channel.appearance_dates` and `rank`.
- [ ] Step 6 — **QA**: open the country panel in browser, verify tooltip appears on hover and keyboard focus, check EN/ES date formatting, confirm "+N more" count is correct, verify no layout shift. Check light and dark themes.
