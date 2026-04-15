# Spec for Compact Footer Layout

branch: refactor/WIF-7-Compact-Footer-Layout

## Summary

The current footer occupies too much vertical screen space. All existing text content must be preserved but the layout needs to be reorganised so the footer takes the smallest possible footprint. The redesign must not overlap or conflict with other UI components (the map, the sidebar, the settings panel, or any fixed/absolute-positioned elements).

## Functional Requirements

- All existing footer text content must remain visible and accessible.
- The footer must occupy significantly less vertical space than the current implementation.
- The footer must not overlap the map, sidebar, info panels, or any other UI component.
- The footer must remain fully readable at all supported viewport sizes (mobile and desktop).
- The footer layout must adapt appropriately to narrow (mobile) and wide (desktop) screens.

## Possible Edge Cases

- Long text strings (e.g. attribution or copyright lines) may wrap or overflow in a compact layout — need to handle gracefully.
- On very small screens the compact layout might still push other components out of place if not constrained correctly.
- The map container height or padding may need to be adjusted to account for the new footer height so the map is not partially hidden behind it.
- Any component that currently uses a `--footer-height` CSS variable (or equivalent offset) must be updated if the footer height changes.

## Acceptance Criteria

- The footer is visibly smaller (shorter) than before without any text being removed.
- No other component is overlapped or obscured by the footer at any viewport size.
- The footer is readable and functional on both mobile and desktop.
- Components that depend on the footer height (e.g. sidebar bottom offset) remain correctly positioned.

## Open Questions

- Should the footer be collapsible (e.g. a chevron to expand/collapse) or always fully visible in its compact form?
- Is there a preferred layout direction for the compact form — e.g. single horizontal row, two columns, or something else?
- Are there any links or interactive elements inside the footer that must remain easily tappable on mobile?

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- Visual check: footer height is reduced compared to current implementation.
- Visual check: all original footer text is present.
- Visual check: no overlap with map, sidebar, or settings panel on mobile and desktop viewports.
- Visual check: footer is readable at narrow (320px) and wide (1280px+) screen widths.

## Clarifications

1. **Layout**: Option A — single horizontal row (title | description | copyright). Most compact; text may wrap on very narrow screens but never truncated or removed.
2. **Hide toggle**: A "Footer" toggle in the MapSettings panel hides/shows the footer completely. Visible by default. State persisted to `localStorage` (key `'footerVisible'`). No new config constant or feature flag needed. A footer-embedded collapse button was considered but discarded — the height difference was only 8px and the collapsed state looked like a confusing empty bar.
3. **Title size**: Reduced from h1 at 20px to a bold inline span at 12–13px to suit the compact row.

## Analysis

### Affected Files

- `src/Footer/Footer.jsx` — simplified to a plain functional component; restructured JSX to a single flex row (title | description | copyright)
- `src/Footer/Footer.scss` — rewritten for compact horizontal row layout (36px height, centered, `|` separators)
- `src/App/App.jsx` — added `footerVisible` state (localStorage `'footerVisible'`, default `true`); synchronously sets `--footer-height` in the state initializer to avoid layout flash; passes state + toggle handler to `Map` and conditionally renders `<Footer />`
- `src/Map/Map.jsx` — accepts and forwards `footerVisible` / `onFooterToggle` props to `MapSettings`
- `src/Map/MapSettings/MapSettings.jsx` — added "Footer" toggle row
- `src/GlobalStyles/Components/_theme.scss` — `--footer-height` reduced from 86/100px to 36px; desktop breakpoint override removed
- `src/Common/translations.js` — added `footerLabel` key (EN: "Footer", ES: "Pie de página")

### Risks & Concerns

- **`--footer-height` layout flash**: Mitigated by setting the CSS variable synchronously inside the `useState` initializer in `App.jsx` before first paint.
- **Long description on mobile**: May wrap to a second visual line on very narrow screens — acceptable and still far more compact than the previous 3-block stack.

### Decisions

- **Hide via MapSettings** (not a footer-embedded button): follows the existing pattern for all other map toggles; produces a meaningful space saving (full 36px vs 8px for a collapse strip).
- **`--footer-height` set to `0px` when hidden**: ensures the map fills the full viewport and no gap remains where the footer was.
- **No new config constant**: localStorage key `'footerVisible'` is a string literal in `App.jsx` (per user's preference).

## Implementation Plan

- [x] Step 1: Add collapse state and toggle to `src/Footer/Footer.jsx` — `isOpen` state from `localStorage` (`'footerOpen'`, default `true`); `useEffect` to persist changes and to update `--footer-height` on `document.documentElement` (open: `'36px'`, collapsed: `'28px'`); restructure JSX to a single flex row with title, description, copyright, and a toggle chevron button.
- [x] Step 2: Rewrite `src/Footer/Footer.scss` — compact single-row horizontal layout (flex row, items center-aligned, small uniform font size, `gap`-separated); collapsed state (`.footer--collapsed`) hides the content row and shrinks to a thin strip with only the toggle visible; smooth height transition.
- [x] Step 3: Update `src/GlobalStyles/Components/_theme.scss` — change `--footer-height` to `36px` (default) and remove or simplify the `≥604px` breakpoint override (no longer needed for a single-row footer).
- [x] Step 4: Add toggle button aria-labels to `src/Common/translations.js` — `footerCollapse` and `footerExpand` keys in both EN and ES.
- [x] Step 5: Build verification — run `npm run build` and confirm no errors; visually check footer at mobile and desktop widths, open and collapsed states, and confirm map/sidebar/settings panel remain correctly positioned.
