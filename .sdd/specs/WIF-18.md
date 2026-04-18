---
spec_id: WIF-18
spec_type: feature
spec_title: Settings Visibility Feature Flags
branch: feature/WIF-18-Settings-Visibility-Feature-Flags
source: local
source_ref: null
---

# Spec: Settings Visibility Feature Flags

## Context / Background

The app has a settings menu (accessible via a UI control) that lets users toggle map options such as heatmap, map labels, country channels count, etc. Currently, removing an option from the settings menu requires touching the component logic directly. There is no single, centralized place to declare which options are user-configurable.

## Summary

Introduce a dedicated set of boolean constants — one per settings menu option — that control whether each option is visible to the user in the settings menu. All constants default to `true` (all options visible). Setting a constant to `false` hides the corresponding option from the menu without affecting the underlying feature default or its runtime behavior. The constants live in a new config file whose name clearly signals its purpose.

## Functional Requirements

- A new config file is created to house all settings-visibility constants.
- One boolean constant exists per current settings menu option (heatmap, map labels, country channels, and any others currently present).
- All constants default to `true`.
- When a constant is set to `false`, the corresponding row/control is not rendered in the settings menu, and the user cannot interact with it.
- The underlying feature default (e.g. whether the heatmap is on by default) is unaffected — only visibility changes.
- The existing runtime behavior of every setting is fully preserved.
- Each constant has an inline comment explaining what it controls and the effect of setting it to `false`.

## Non-Goals / Out of Scope

- No changes to the logic, state, or persistence of any existing setting.
- No new settings options added.
- No UI changes beyond conditional rendering of existing rows.
- No server-side or per-user configuration — constants are compile-time only.

## Possible Edge Cases

- If all options are hidden (`false`), the settings menu may render empty or with only a header — this state should not crash the UI.
- The settings menu may already conditionally render some items; new flags must compose correctly with any existing conditions.

## Acceptance Criteria

- Each settings option can be individually hidden by flipping its constant to `false` without any other code change.
- With all constants at `true` (the default), the settings menu is visually and functionally identical to before.
- With a constant set to `false`, the corresponding option is absent from the menu and the underlying feature behaves as its own default dictates.
- The new config file is the single place a developer needs to edit to show/hide a settings option.

## Open Questions

- What are all the settings options currently shown in the menu? (Needs codebase confirmation before planning.)
- Should the new file live alongside the existing `config.js`, or in a separate `src/config/` subfolder?

## Clarifications

- **Settings options confirmed (7 total):** Clustering toggle, Fullscreen toggle, Flags toggle, Footer toggle, Heatmap toggle, Labels toggle, Country Channels stepper.
- **File location (Q1-a):** New file `src/settingsVisibility.js` alongside `src/config.js`. No existing imports change.
- **Naming convention (Q2-c):** `SETTING_<FEATURE>_ENABLED` — e.g. `SETTING_HEATMAP_ENABLED`, `SETTING_CLUSTERING_ENABLED`. Groups all flags alphabetically and avoids collision with existing `HEATMAP_ENABLED` etc. in `config.js`.
- **Country Channels stepper (Q3-a):** Include `SETTING_COUNTRY_CHANNELS_ENABLED` for full consistency across all 7 options.

## Analysis

### Affected Files

**Create:**
- `src/settingsVisibility.js` — 7 new boolean constants, all `true`, each with an inline comment.

**Modify:**
- `src/Map/MapSettings/MapSettings.jsx` — import the 7 constants; wrap each settings row in a conditional render guard.

No other files need to change. `Map.jsx` passes props down to `MapSettings` — the props stay; the component simply skips rendering items whose flag is `false`. `App.jsx` and state management are untouched.

### Risks & Concerns

- **Name collision:** `SETTING_HEATMAP_ENABLED` vs existing `HEATMAP_ENABLED` in `config.js` — different names, different files, no conflict.
- **Empty menu:** If all 7 flags are `false`, the panel renders with only the title. No crash risk — the panel `<div>` and title `<p>` are always rendered. Acceptable edge case per spec.
- **Prop/propTypes cleanup:** Props like `onHeatmapToggle` are still passed from `Map.jsx` even when the heatmap row is hidden. This is intentional — the underlying state and handler remain active; only the UI row is hidden. No prop removal needed.

### Decisions

- Constants live in `src/settingsVisibility.js`, not `config.js`, to keep the two concerns (feature flags vs. UI visibility) clearly separated.
- Conditional rendering is done inside `MapSettings.jsx` only — no changes to the prop interface or parent components.
- All 7 options (including the stepper) get a visibility flag for full consistency.

## Implementation Plan

- [x] Step 1: Create `src/settingsVisibility.js` with 7 `SETTING_*_ENABLED` constants (all `true`), each with an inline comment explaining its purpose.
- [ ] Step 2: Update `src/Map/MapSettings/MapSettings.jsx` — import the 7 constants and wrap each settings row with a conditional render guard (`{SETTING_X_ENABLED && <label ...>}`).
- [ ] Step 3: Manual QA — verify all options visible by default; flip one flag to `false` and confirm that row disappears without affecting the underlying feature or other rows.

## Testing Guidelines

- No automated tests are configured for this project (see CLAUDE.md).
- Manual QA: with all flags `true`, open settings menu — all existing options visible and functional.
- Manual QA: set one flag to `false`, reload — that option is absent; all others remain; underlying feature uses its own default.
- Manual QA: set all flags to `false` — settings menu renders without crashing.
