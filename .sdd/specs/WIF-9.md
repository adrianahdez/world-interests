# Spec for Revert Spanish Translations To Backend Source

branch: refactor/WIF-9-Revert-Spanish-Translations-To-Backend-Source

## Summary

The backend was previously missing Spanish translations for category names, so the frontend implemented a workaround to supply them. The backend has now been fixed and already returns Spanish category names in the same bilingual format used for English names (`{en: {slug: name}, es: {slug: name}}`). The frontend workaround should be removed so that Spanish category names are sourced from the backend response everywhere they are displayed, consistent with how English names are already handled.

## Functional Requirements

- Remove any hardcoded or frontend-defined Spanish category name translations.
- Wherever a category name is displayed, use the name from the backend response for the active language (Spanish or English), the same way English names are currently used.
- The category display should work correctly when the language is toggled between English and Spanish.
- No frontend Spanish translation data should remain in the codebase after this change.

## Possible Edge Cases

- A category slug returned by the backend may not have a corresponding Spanish name in the `es` response (e.g., if the backend is partially updated). The UI should degrade gracefully rather than crash.
- If the language context is Spanish but the `es` map from the backend is missing or empty, the app should fall back to English names rather than showing blank or undefined values.
- Components that previously read Spanish translations from a local source must now correctly use the language-aware backend data without any behavioral regression for English users.

## Acceptance Criteria

- No hardcoded Spanish category name strings or translation maps remain in the frontend code.
- Switching the app language to Spanish displays the Spanish category names as returned by the backend.
- Switching the app language to English continues to display English category names as before.
- All locations in the UI that show a category name (sidebar, dialog, URL param label, map markers, etc.) reflect the active language from the backend data.
- The app does not error or show undefined/blank category names under normal backend response conditions.

## Open Questions

- Are there any locations in the UI beyond the sidebar, dialog, and map where category names are displayed that should also be updated?
- Should the fallback behavior when `es` names are missing from the backend response be English name, empty string, or slug?

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- Category name renders in English when language is set to English.
- Category name renders in Spanish (from backend) when language is set to Spanish.
- If the Spanish name for a category is absent from the backend response, the English name is shown as a fallback.

## Clarifications

- Category names only appear in two places: the category list in the Categories sidebar, and the channel details panel in InfoSidebar. No markers, URL params, or other surfaces.
- Fallback when a Spanish name is missing from the backend: use the English name from the same backend response.
- Category names (both EN and ES) must be removed entirely from `translations.js` — they are content data owned by the backend, not UI strings owned by the frontend. The `translations` import in `Categories.jsx` should also be removed since `categoryNames` was its only use there.

## Analysis

### Affected Files

**`src/Common/translations.js`**
- Remove the `categoryNames` block from the `en` section (lines 29–45, including the comment)
- Remove the `categoryNames` block from the `es` section (lines 74–89, including the comment)

**`src/Categories/Categories.jsx`**
- Remove `import translations from '../Common/translations'` (line 6) — no longer used here
- Simplify the category transform (lines 53–58): use `name` from the backend directly, falling back to `parsedResult.en?.[slug]` when the Spanish name is absent

### Risks & Concerns

- **Regression for English users**: none expected — the backend already returns correct English names and the current workaround for EN is a no-op (hardcoded names match backend names).
- **Missing Spanish names**: handled by the English fallback using `parsedResult.en?.[slug]` from the same backend response object already in scope.
- **No tests exist**: the project has no test suite configured (per CLAUDE.md), so no automated regression safety net. Manual verification via the dev server is required.

### Decisions

- Remove `categoryNames` from `translations.js` entirely for both languages. Category names are backend content, not frontend UI strings.
- Remove the `translations` import from `Categories.jsx` — it is no longer used in that file after `categoryNames` is gone. Other files (`Footer`, `Head`, `InfoSidebar`, `Map`) retain their own `translations` imports for UI strings.
- Fallback chain in the transform: `name || parsedResult.en?.[slug] || slug` — covers missing Spanish name, then last-resort raw slug.

## Implementation Plan

- [x] Step 1: Remove `categoryNames` blocks from `src/Common/translations.js` — delete both the `en.categoryNames` and `es.categoryNames` entries and their associated comments.
- [x] Step 2: Update `src/Categories/Categories.jsx` — remove the `translations` import, replace the workaround transform with a direct backend name lookup plus English fallback, and remove the stale workaround comment.
- [x] Step 3: Manual smoke-test on the dev server — verify the category list renders correctly in both English and Spanish after the language toggle.
