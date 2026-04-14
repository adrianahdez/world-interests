# Spec for Fix YouTube Player Console Warnings And Errors

branch: bugfix/WIF-3-Fix-YouTube-Player-Console-Warnings-And-Errors

## Summary

When a user clicks a map pin, a modal opens with a YouTube video player. Two sets of browser console issues appear, even though the functionality itself works correctly:

1. **On modal open (pin click):** A browser warning `Unrecognized feature: 'web-share'` is logged by the YouTube IFrame API. Additionally, two `console.log` errors appear: `Failed to get subsystem status for purpose` with a `Attempting to use a disconnected port object` message — these originate from a browser extension content script reacting to the YouTube embed loading.

2. **On video play:** Multiple uncaught promise errors `Uncaught Error: Attempting to use a disconnected port object` appear in the console (also from a browser extension content script). A network request to `googleads.g.doubleclick.net` returns a 302, which is an ad conversion tracking call triggered by YouTube itself.

The goal is to resolve or suppress these issues at the application level in the best way possible, for both development and production environments.

## Functional Requirements

- The YouTube IFrame embed must include the necessary `allow` attribute on the iframe to declare the `web-share` permission policy, eliminating the `Unrecognized feature: 'web-share'` warning.
- The Player component must cleanly destroy the YouTube player instance when the modal is closed or the component unmounts, to minimize stale port/connection errors triggered by browser extensions reacting to lingering player state.
- The solution must not break existing video playback, modal open/close behavior, or any other player functionality.
- The fix must work in both the development environment and the production Cloudflare Pages deployment.

## Possible Edge Cases

- The `web-share` permission policy attribute may need to be set on the iframe rendered by the YouTube IFrame API, which is injected dynamically — direct iframe attribute access may be needed post-API initialization.
- The `Attempting to use a disconnected port object` errors originate from browser extension content scripts (not app code), so they cannot be fully eliminated — only minimized by ensuring the player is properly torn down.
- The Google Ads 302 request is initiated by YouTube's own embed code and cannot be blocked from the application level; it should be documented as out of scope for this fix.
- Rapid open/close of the modal could create race conditions in player initialization and teardown.
- The IFrame API loads asynchronously; teardown must account for cases where the player object may not yet be fully initialized when unmount occurs.

## Acceptance Criteria

- After clicking a map pin, the `Unrecognized feature: 'web-share'` warning no longer appears in the browser console.
- The `Failed to get subsystem status for purpose` errors in the console are reduced or eliminated when the modal opens.
- The `Uncaught Error: Attempting to use a disconnected port object` errors in the console are reduced or eliminated when the video is played.
- The YouTube video plays correctly when the modal is open.
- The modal opens and closes correctly with no regressions.
- The fix works in both development (`localhost:9000`) and production (`worldinterests.midri.net`).

## Open Questions

- Is there a specific version of the YouTube IFrame API being targeted, or is the latest always assumed?
- Are there any constraints on modifying the iframe `allow` attribute after the YouTube IFrame API creates the element, or is pre-configuration via API options preferred?

## Clarifications

- **Decision A (web-share warning):** Use A1 — add `Permissions-Policy: web-share=self` via `devServer.headers` in webpack for development, and a `_headers` file copied to `dist/` for Cloudflare Pages production.
- **Decision B (disconnected port errors):** Use B1 — conditionally render `<Player>` only when `isSidebarOpen` is true, so the YouTube iframe is fully torn down (including `player.destroy()`) when the sidebar closes. B2's only advantage would be instant playback resumption on same-video reopen (no re-initialization flash), but B1 is preferred for proper iframe lifecycle management.
- **Google Ads 302 request:** Confirmed out of scope — cannot be controlled from the application.
- **URL change relationship:** The errors are unrelated to any recent dev URL configuration changes. The `web-share` warning is from a recent Chromium enforcement change. The disconnected port errors come from a browser extension reacting to YouTube iframes on any origin. The doubleclick 302 is YouTube's own ad tracking, always present when a video plays.

## Analysis

### Affected Files

**Frontend app (`/home/adriana/PROYECTOS/world-interests`)**

- `src/InfoSidebar/InfoSidebar.jsx` — add `isSidebarOpen &&` to the Player conditional render so the component unmounts on sidebar close, triggering player teardown
- `webpack.config.js` — add `devServer.headers` with `Permissions-Policy: web-share=self` for the dev server
- `_headers` (new file, root) — Cloudflare Pages HTTP response headers declaring `Permissions-Policy: web-share=self`
- `webpack.config.js` CopyWebpackPlugin patterns — add `_headers` to the list of copied files (alongside `_redirects`, `sitemap.xml`, etc.)

**No backend changes required.**

### Risks & Concerns

- **Player re-initialization flash (B1 trade-off):** When the sidebar reopens for the same video, the `YT.Player` instance is recreated. The YouTube API script is already cached after the first load, so this is fast, but a brief blank frame before the embed renders is expected. This is acceptable given the clean lifecycle benefits.
- **Race condition on rapid open/close:** If the sidebar is opened before the YouTube IFrame API script finishes loading (first open only), and then closed, `window.onYouTubeIframeAPIReady` will still fire after unmount. The `playerRef.current` will be null (component is unmounted), which could cause a runtime error. This is a pre-existing issue not introduced by this fix; mitigating it is out of scope here but worth noting.
- **`pauseVideo` in InfoSidebar's useEffect becomes a no-op:** With B1, when `isSidebarOpen` becomes false the Player unmounts before InfoSidebar's effect runs, making `playerRef.current` null and the `pauseVideo` call silently skipped. This is safe and intentional — the player is being destroyed anyway.
- **Extension errors cannot be fully eliminated:** B1 minimizes the window during which the extension's content script can establish a connection, but errors may still appear briefly on iframe load. This is documented as the best achievable result.
- **`Permissions-Policy` header scope:** Using `web-share=self` restricts the permission to the same origin only, which is appropriate. The YouTube iframe (cross-origin) receives the permission via the `allow` attribute that the YouTube API sets on its iframe — this chain works once the parent page has the header.

### Decisions

- **A1 chosen over A2:** The HTTP headers approach is semantically correct (fixes the permission declaration at the HTTP level) and requires no app-code coupling to YouTube's internal `getIframe()` API. It also works at the page level regardless of how many YouTube embeds may exist.
- **B1 chosen over B2:** Fully removing the iframe from the DOM when the sidebar is closed eliminates the extension's trigger target, providing the best available reduction of disconnected-port errors. The one-time re-initialization cost on reopen is acceptable.

## Implementation Plan

- [x] Step 1: Add `Permissions-Policy: web-share=self` to the webpack dev server — modify `devServer` in `webpack.config.js` to include a `headers` object with the policy.
- [x] Step 2: Create `_headers` file in the project root with the `Permissions-Policy: web-share=self` rule for all routes (`/*`), following the same pattern as `_redirects`.
- [ ] Step 3: Add `_headers` to the `CopyWebpackPlugin` patterns in `webpack.config.js` so it is copied to `dist/` during both dev and production builds.
- [ ] Step 4: Conditionally render `<Player>` in `InfoSidebar.jsx` — prepend `isSidebarOpen &&` to the existing Player conditional so the component mounts only when the sidebar is open and unmounts (triggering `player.destroy()`) when it closes.
- [ ] Step 5: Manual verification — run `npm run dev`, open DevTools, click a pin, confirm `web-share` warning is gone; close the sidebar, reopen it, confirm no regression in video playback; confirm disconnected port errors are reduced or absent.

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- There are no automated tests or linting configured in this project (per CLAUDE.md). Verification should be done manually:
  - Open the app in a browser with DevTools open.
  - Click a map pin and confirm no `Unrecognized feature: 'web-share'` warning appears.
  - Confirm `Failed to get subsystem status` errors are not present or are reduced.
  - Click play on the embedded video and confirm `Uncaught Error: Attempting to use a disconnected port object` errors are not present or are reduced.
  - Close and reopen the modal multiple times to confirm no regressions in open/close behavior.
  - Test in both development and production URLs.
