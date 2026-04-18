---
spec_id: WIF-16
spec_type: bugfix
spec_title: Map Pin Style Loss on Language Change
branch: bugfix/WIF-16-Map-Pin-Style-Loss-On-Language-Change
source: local
source_ref: null
---

# Spec: Map Pin Style Loss on Language Change

## Context / Background
The map renders custom pins for each country, with styles derived from channel data (views count, channel name). When the user toggles the language (EN ↔ ES), some pins lose their visual styling — background color, padding, and other CSS properties disappear — while others remain intact.

## Summary
A subset of map pins lose their inline style configuration when the language is toggled. The affected pins are those whose appearance depends on channel views and channel name data. The bug does not affect all pins, suggesting a rendering or re-mount issue triggered by the language change that causes some Leaflet marker icons to be recreated without their full style context.

## Functional Requirements
- All map pins must retain their full style (background color, padding, and any other CSS properties) after a language toggle.
- Pins that were styled before the language change must display identically after it.
- Language toggle must not trigger a full map data refetch; only label text should change.

## Non-Goals / Out of Scope
- Changing the visual design of the pins.
- Fixing unrelated map re-render behavior not caused by language toggle.
- Adding new language support beyond EN/ES.

## Possible Edge Cases
- Pins that were never fully rendered (e.g., off-screen) may behave differently on re-render.
- Rapid language toggling could interleave render cycles, causing partial style application.
- Pins whose style depends on asynchronous data (views count loaded lazily) may lose styles if the data is not yet available when the re-render fires.
- Category change + language change in quick succession could compound the issue.

## Acceptance Criteria
- Toggle language while any category is active: all visible pins keep their background color, padding, and other styles.
- Inspect any pin's DOM after toggling language: inline styles match those before the toggle.
- No console errors related to Leaflet icon or marker recreation during language toggle.
- Behavior is consistent across all categories, not just the one active when the bug was reported.

## Open Questions
- ~~Are the affected pins created via `divIcon` with inline styles, while unaffected ones use a different icon strategy?~~ Confirmed: all pins use `divIcon`. Styles are applied as post-render DOM mutations via `changePointAppearance`; the mutation step is what's skipped on language toggle.
- ~~Does the bug reproduce on every language toggle or only the first one?~~ Every toggle, because every toggle rebuilds the `divIcon` HTML and the new DOM nodes never receive their inline styles.
- ~~Is there a key or identity mechanism on markers that should prevent re-mounting but isn't working?~~ The `markers` useMemo intentionally includes `isEs` in its deps (line 472 of `Map.jsx`) to rebuild DivIcons on language change. The issue is that `processPoint` — which applies inline styles — is in a separate effect with `[data]` only, so it never reruns after the rebuild.

## Dependencies
- LanguageContext (`src/`) — language toggle mechanism.
- Map markers / pin components in `src/Map/Points/`.

## Success Metrics
- Zero reports of pin style loss after language toggle in production.

## Testing Guidelines
- Manual: load each category, toggle language, verify all pins retain styling.
- Manual: toggle language multiple times in quick succession; check for regressions.
- Manual: switch category then toggle language; verify no style loss in the new category's pins.

## Clarifications

Root cause identified from codebase exploration — no user decisions required.

- All pins use `L.divIcon` (via `CustomMarker`). Inline styles (background color, padding, `--pin-brightness`) are applied by `changePointAppearance` in `Points.js`, called from `processPoint`, which is called inside a `useEffect` in `Map.jsx` with `[data]` as its only dependency.
- When language toggles, the `markers` useMemo (dep array: `[data, clusteringEnabled, isEs]`) rebuilds all markers, creating fresh DOM nodes. The `processPoint` effect does not rerun because `isEs` is absent from its dep array — so the new DOM nodes never receive their inline styles.
- Fix: add `isEs` to the `processPoint` effect's dependency array (`[data]` → `[data, isEs]`) in `Map.jsx` line 253.

## Analysis

### Affected Files
**`src/Map/Map.jsx`**
- Line 253: `}, [data]);` → change to `}, [data, isEs]);`

### Risks & Concerns
- **Double run on category change:** `data` and `isEs` are independent deps. If both change simultaneously (e.g., a deep-link load sets category and language at once), `processPoint` runs twice. Second run is a no-op because DOM output is idempotent — acceptable.
- **Timing:** `processPoint` queries the DOM for `.custom-marker__point[data-region]` elements. If the `markers` memo and the effect fire in the same render cycle, the new DOM elements must already exist when the effect runs. React guarantees effects run after paint, and `CustomMarker` commits its Leaflet marker to the DOM in its own `useEffect` — this is the same ordering that works today when `data` changes, so no new timing risk.
- **eslint-disable comment:** Line 471 in `Map.jsx` has an `eslint-disable-next-line react-hooks/exhaustive-deps` comment for the `markers` useMemo, not for the `processPoint` effect. No changes needed to comments.

### Decisions
- Add `isEs` to the `processPoint` effect dep array rather than introducing a separate effect or ref — minimal change, consistent with existing pattern.

## Implementation Plan
- [x] Step 1: In `src/Map/Map.jsx` line 253, change `}, [data]);` to `}, [data, isEs]);`
- [x] Step 2: Manual QA — load each category, toggle language, confirm all pins retain background color, padding, and filter styles; toggle rapidly; switch category then toggle language.
