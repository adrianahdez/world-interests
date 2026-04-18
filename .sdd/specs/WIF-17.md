---
spec_id: WIF-17
spec_type: refactor
spec_title: Rename InfoSidebar To ChannelPanel
branch: refactor/WIF-17-Rename-InfoSidebar-To-ChannelPanel
source: local
source_ref: null
---

# Spec: Rename InfoSidebar To ChannelPanel

## Context / Background

The application has a `CountryPanel` component (the panel that opens when clicking a country polygon). The equivalent panel for channel pins is currently named `InfoSidebar`, which is inconsistent with the established naming convention. Aligning both panels under the `*Panel` suffix improves codebase readability and developer experience.

## Summary

Rename the `InfoSidebar` component to `ChannelPanel` — covering the folder, file, component name, CSS class names, and all import/usage references across the application — without changing any logic, styling values, or rendered behavior.

## Functional Requirements

- The folder `src/InfoSidebar/` is renamed to `src/ChannelPanel/`.
- The file `InfoSidebar.jsx` is renamed to `ChannelPanel.jsx`.
- The SCSS file `InfoSidebar.scss` is renamed to `ChannelPanel.scss`.
- The React component export name is updated from `InfoSidebar` to `ChannelPanel`.
- All import statements that reference `InfoSidebar` are updated to `ChannelPanel`.
- All JSX usages of `<InfoSidebar` are updated to `<ChannelPanel`.
- CSS class names that include `info-sidebar` or `InfoSidebar` (if any) are updated to match the new name.
- The application compiles and runs without errors after the rename.

## Non-Goals / Out of Scope

- No changes to component logic, props, state, or lifecycle behavior.
- No changes to visual design, layout, or styles beyond class-name strings that must be renamed.
- No changes to the backend API or data flow.

## Possible Edge Cases

- Dynamic class name strings (e.g. template literals or conditionals) referencing the old name must be caught — a simple text search may miss them.
- The SCSS file may import other files or be imported by global styles; those import paths must be updated.
- Git may not preserve history through a folder rename if done with raw file operations instead of `git mv`.

## Acceptance Criteria

- No file, folder, variable, class, or string in the codebase contains `InfoSidebar` after the change.
- The channel-pin panel opens and closes correctly in both English and Spanish.
- The channel-pin panel renders correctly in both dark and light mode.
- The app compiles with no errors or warnings introduced by this change.
- `git log --follow` on the renamed files shows history continuity (use `git mv`).

## Open Questions

- Are there any hardcoded strings (e.g. in comments, test IDs, or analytics events) referencing `InfoSidebar` that should also be renamed?

## Clarifications

- **Comments:** Yes — `InfoSidebar` appears in comments across 6 src files (`App.jsx`, `CountryPanel.jsx`, `CountryPanel.scss`, `SidebarContext.jsx`, `MapPointContext.jsx`, `CustomMarker.jsx`, `translations.js`). The AC requires zero remaining occurrences, so all comments are updated.
- **CSS class names:** No `info-sidebar` BEM class exists; the SCSS uses `.sidebar--map-point`. No CSS class renaming needed.
- **`git mv`:** Used for the folder rename to preserve history per the AC.

## Analysis

### Affected Files

**Rename (via `git mv`):**
- `src/InfoSidebar/InfoSidebar.jsx` → `src/ChannelPanel/ChannelPanel.jsx`
- `src/InfoSidebar/InfoSidebar.scss` → `src/ChannelPanel/ChannelPanel.scss`

**Modify — functional references:**
- `src/ChannelPanel/ChannelPanel.jsx` — SCSS import path, function name, propTypes identifier
- `src/App/App.jsx` — import path, JSX tag, comment

**Modify — comments only:**
- `src/CountryPanel/CountryPanel.jsx` — 1 comment
- `src/CountryPanel/CountryPanel.scss` — 1 comment
- `src/Common/SidebarContext.jsx` — 2 comment lines
- `src/Common/MapPointContext.jsx` — 2 comment lines
- `src/Common/CountryPanelContext.jsx` — 1 comment
- `src/CustomMarker/CustomMarker.jsx` — 1 comment
- `src/Common/translations.js` — 2 comment lines

### Risks & Concerns

- **Git history:** Using raw `mv` instead of `git mv` would break `git log --follow`. Mitigated: plan uses `git mv`.
- **Missed occurrences:** A stale reference left in a comment breaks the AC. Mitigated: grep for `InfoSidebar` after all edits before committing.

### Decisions

- Single atomic commit for the entire rename (folder + all reference updates), since splitting would leave the repo in a broken intermediate state (missing import).

## Implementation Plan

- [x] Step 1: `git mv src/InfoSidebar src/ChannelPanel` — rename folder preserving history.
- [x] Step 2: Within `src/ChannelPanel/`, rename files: `git mv src/ChannelPanel/InfoSidebar.jsx src/ChannelPanel/ChannelPanel.jsx` and `git mv src/ChannelPanel/InfoSidebar.scss src/ChannelPanel/ChannelPanel.scss`.
- [x] Step 3: Update `src/ChannelPanel/ChannelPanel.jsx` — fix SCSS import, function name, comment, and propTypes identifier.
- [x] Step 4: Update `src/App/App.jsx` — fix import path, JSX tag, and comment.
- [x] Step 5: Update comments in `src/CountryPanel/CountryPanel.jsx`, `src/CountryPanel/CountryPanel.scss`, `src/Common/SidebarContext.jsx`, `src/Common/MapPointContext.jsx`, `src/Common/CountryPanelContext.jsx`, `src/CustomMarker/CustomMarker.jsx`, `src/Common/translations.js`.
- [x] Step 6: Verify — grep for `InfoSidebar` across the whole repo; result must be zero matches in `src/`.
- [x] Step 7: Commit all changes in one commit. Message: `WIF-17: rename InfoSidebar to ChannelPanel`.
- [x] Step 8: Manual QA — open channel-pin panel, verify open/close, language toggle, dark/light mode, no layout regressions.

## Testing Guidelines

- No automated tests are configured for this project (see CLAUDE.md).
- Manual QA: click a channel pin → panel opens with correct content; click again or close → panel dismisses.
- Manual QA: toggle language (EN ↔ ES) while panel is open → content updates, panel remains visible.
- Manual QA: toggle dark/light mode → panel styling applies correctly.
- Visual check: no layout regressions on the map or sidebar area.
