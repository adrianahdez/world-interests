# Spec for Fix YouTube Player Console Warnings And Errors

branch: bugfix/WIF-3-Fix-YouTube-Player-Console-Warnings-And-Errors

## Summary

When a user clicks a map pin, a modal opens with a YouTube video player. Several browser console issues appear, even though the functionality itself works correctly:

1. **On modal open (pin click):** A browser warning `Unrecognized feature: 'web-share'` is logged by YouTube's `www-widgetapi.js` (loaded by the YouTube IFrame API). Additionally, Chrome's built-in Cast component extension logs `Failed to get subsystem status for purpose` errors.

2. **On video play:** Chrome's Cast extension fires an infinite loop of `Uncaught Error: Attempting to use a disconnected port object` promise rejections while the video plays. A network request to `googleads.g.doubleclick.net` returns a 302 (YouTube's own ad tracking).

The goal was to resolve or suppress these issues at the application level where possible.

## Functional Requirements

- Eliminate the `Unrecognized feature: 'web-share'` warning from the console.
- Maintain video playback and pause-on-sidebar-close functionality.
- The solution must work in both development (`localhost:9000`) and production (`worldinterests.midri.net`).

## Acceptance Criteria

- After clicking a map pin, the `Unrecognized feature: 'web-share'` warning no longer appears in the browser console.
- The YouTube video plays correctly when the modal is open.
- The modal opens and closes correctly with no regressions.
- Closing the sidebar pauses the video.
- The fix works in both development and production.

## Clarifications

- **`web-share` warning:** Caused by YouTube's `www-widgetapi.js` checking a Permissions-Policy feature (`web-share`) that Chrome 120+ removed from its feature registry. Adding a `Permissions-Policy: web-share=self` HTTP header was attempted but Chrome rejects the header with a new error (`Error with Permissions-Policy header: Unrecognized feature: 'web-share'`). The only fix is to avoid loading `www-widgetapi.js` entirely.
- **Chrome Cast extension errors (`content-script.js`, `content-utils.js`):** These come from Chrome's built-in Cast component extension, not a third-party extension. They appear even in incognito mode with all extensions disabled. They fire when Chrome detects a YouTube iframe (on pin click) and loop during playback (Cast polls the iframe's media state through a port that keeps disconnecting). These cannot be fixed from application code — they are a bug in Chrome's internal Cast extension.
- **Google Ads 302 request:** Out of scope — YouTube's own ad conversion tracking, cannot be blocked from the application.
- **B1 approach (conditional rendering) caused Chrome crash:** Destroying/recreating the YouTube iframe on each sidebar open/close destabilised Chrome's Cast extension, causing an infinite loop of promise rejections that crashed the browser. Reverted.
- **`youtube-nocookie.com` via YT.Player `host` option:** Chrome's Cast extension does not discriminate by iframe domain — it monitors all YouTube embeds regardless. Did not help.

## Analysis

### Affected Files

- `src/Player/Player.jsx` — replaced YouTube IFrame API (`YT.Player`) with a plain `<iframe>` element using `youtube-nocookie.com/embed/{id}` and postMessage-based pause control.

### Risks & Concerns

- **Less programmatic control:** Plain iframe + postMessage only supports sending commands (pause, stop, play). Reading player state (getCurrentTime, getPlayerState) or listening to events (onStateChange) is not available without additional postMessage listener setup. This app only uses `pauseVideo()`, so this is not a concern.
- **Full iframe reload on video change:** When `idVideo` changes, the iframe `src` changes, causing a full reload instead of a smooth `loadVideoById()` transition. Imperceptible in practice since the user is switching to a different pin/country.
- **Cast extension errors remain:** Chrome's built-in Cast extension errors on pin click and during playback cannot be eliminated from application code. They don't affect functionality and are invisible to end users (only visible in DevTools).

### Decisions

- **Plain iframe chosen over YouTube IFrame API:** Avoids loading `www-widgetapi.js` entirely, which is the source of the `web-share` warning. The YouTube IFrame API provides no value for this app's use case (only `pauseVideo` is needed, which works via postMessage).
- **`youtube-nocookie.com` used as embed domain:** Privacy-enhanced mode. No functional difference for basic embed playback.
- **Permissions-Policy header approach abandoned:** Chrome 120+ does not recognise `web-share` as a valid Permissions-Policy feature. The header adds a new browser error instead of fixing the warning.
- **B1 conditional rendering abandoned:** Causes Chrome crash via Cast extension conflict when the iframe is destroyed/recreated.

## Implementation Plan

- [x] Step 1: ~~Add `Permissions-Policy: web-share=self` to webpack dev server~~ — REVERTED: Chrome rejects the header.
- [x] Step 2: ~~Create `_headers` file~~ — REVERTED: removed file.
- [x] Step 3: ~~Add `_headers` to `CopyWebpackPlugin`~~ — REVERTED: removed entry.
- [x] Step 4: ~~Conditionally render `<Player>` based on `isSidebarOpen`~~ — REVERTED: caused Chrome crash.
- [x] Step 5: Revert steps 1–4, replace YouTube IFrame API with plain `<iframe>` + postMessage in `Player.jsx`. Eliminates `www-widgetapi.js` and the `web-share` warning.
- [x] Step 6: Manual verification — confirmed: `web-share` warning gone, page load clean, video plays, pause on sidebar close works. Cast extension errors on pin click and during playback remain (unfixable from app code).

## Testing Guidelines

There are no automated tests or linting configured in this project (per CLAUDE.md). Verification is manual:

- Open the app in a browser with DevTools console open.
- Confirm page load shows no `web-share` or Permissions-Policy errors.
- Click a map pin and confirm the `Unrecognized feature: 'web-share'` warning does not appear.
- Play the embedded video and confirm it works correctly.
- Close the sidebar and confirm the video pauses.
- Close and reopen the modal multiple times to confirm no regressions.
- Test in both development (`localhost:9000`) and production (`worldinterests.midri.net`).
- Note: `Failed to get subsystem status` (on pin click) and `Uncaught (in promise) disconnected port` (during playback) are from Chrome's built-in Cast extension and cannot be eliminated.
