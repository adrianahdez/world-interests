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

1. **Layout**: Option A — single horizontal row (title · description · copyright). Most compact; text may wrap on very narrow screens but never truncated or removed.
2. **Collapsible**: Yes. A toggle button collapses the footer to a thin strip. Open by default. State persisted to `localStorage` (key `'footerOpen'`). No new config constant or feature flag needed.
3. **Title size**: Can be freely resized to suit the compact layout (no longer needs to be an `h1` at 20px).

## Analysis

### Affected Files

**Footer:**
- `src/Footer/Footer.jsx` — add collapse state (localStorage `'footerOpen'`, default `true`), toggle button, restructured single-row JSX layout; dynamically update `--footer-height` CSS variable on the root element when state changes
- `src/Footer/Footer.scss` — rewrite for compact horizontal row layout + collapsed strip state

**Global styles / CSS variable consumers:**
- `src/GlobalStyles/Components/_theme.scss` — reduce `--footer-height` default values to match new compact open height (~36px); remove desktop breakpoint override since a single-row footer no longer needs a different height at wider viewports
- `src/main.scss` — no changes needed (consumes `--footer-height` dynamically)
- `src/GlobalStyles/Components/_sidebars.scss` — no changes needed (consumes `--footer-height` dynamically)
- `src/Map/MapSettings/MapSettings.scss` — no changes needed (consumes `--footer-height` dynamically)

**Translations:**
- `src/Common/translations.js` — add `footerCollapse` / `footerExpand` aria-label keys (EN + ES) for the toggle button

### Risks & Concerns

- **`--footer-height` mismatch on first render**: The CSS variable is set in `_theme.scss` and may not match the JS-updated value before the first `useEffect` fires. Fix: set the initial value in `_theme.scss` to the correct compact-open height so CSS and JS agree on mount.
- **Collapsed height drift**: When collapsed, the footer is a thin strip but `--footer-height` in CSS defaults to the open height. The JS `useEffect` must run on mount (not just on toggle) to apply the correct collapsed height if the user's localStorage says `false`.
- **Map container height jumps**: `.map-container` height depends on `--footer-height`. When the footer is toggled, the map briefly resizes. This is expected and acceptable — add a CSS `transition` on `.map-container` height if it looks jarring.
- **Long description on mobile**: On very narrow screens the description may push the footer to 2 visual lines. This is acceptable and still far more compact than the current 3-block stack.

### Decisions

- **Layout**: Single flex row (title + description + copyright) separated by `·` or `|` dividers for clarity. Toggle chevron on the far right.
- **Collapsed state**: Footer shrinks to a ~28px strip showing only a thin bar and the expand chevron.
- **`--footer-height` management**: Two approaches were considered: (a) CSS-only with two variables + a class toggle, (b) JS imperatively sets the variable. Chose **(b)** — consistent with how the rest of the app handles dynamic layout (e.g. zoom class toggling); avoids adding a second CSS variable that all consumers would need to know about.
- **No new config constant**: localStorage key `'footerOpen'` is used directly in `Footer.jsx` as a string literal (per user's preference).

## Implementation Plan

- [x] Step 1: Add collapse state and toggle to `src/Footer/Footer.jsx` — `isOpen` state from `localStorage` (`'footerOpen'`, default `true`); `useEffect` to persist changes and to update `--footer-height` on `document.documentElement` (open: `'36px'`, collapsed: `'28px'`); restructure JSX to a single flex row with title, description, copyright, and a toggle chevron button.
- [x] Step 2: Rewrite `src/Footer/Footer.scss` — compact single-row horizontal layout (flex row, items center-aligned, small uniform font size, `gap`-separated); collapsed state (`.footer--collapsed`) hides the content row and shrinks to a thin strip with only the toggle visible; smooth height transition.
- [x] Step 3: Update `src/GlobalStyles/Components/_theme.scss` — change `--footer-height` to `36px` (default) and remove or simplify the `≥604px` breakpoint override (no longer needed for a single-row footer).
- [x] Step 4: Add toggle button aria-labels to `src/Common/translations.js` — `footerCollapse` and `footerExpand` keys in both EN and ES.
- [ ] Step 5: Build verification — run `npm run build` and confirm no errors; visually check footer at mobile and desktop widths, open and collapsed states, and confirm map/sidebar/settings panel remain correctly positioned.
