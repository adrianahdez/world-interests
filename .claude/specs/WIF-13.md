# Spec for GA Warning Message Misleading In Dev Environment

branch: bugfix/WIF-13-GA-Warning-Message-Misleading-In-Dev

## Summary

The console warning `[WorldInterests] REACT_APP_GA_ID is not set — GA tracking is disabled in this environment. Add it to .env.production to enable tracking in production builds.` appears in the development environment even though the GA ID is correctly set in `.env.production`.

This is expected behavior: webpack loads `.env` in development and `.env.production` in production builds, so `REACT_APP_GA_ID` is intentionally absent from the dev bundle. The current warning message is misleading — it reads like a misconfiguration when the setup is actually correct.

The fix covers four distinct warning scenarios across dev and production:

1. **Dev, ID absent** (normal/expected): informational warn — GA is disabled in dev as expected; reminder to ensure the ID is present in `.env.production` so production tracking works.
2. **Dev, ID present in `.env`** (misconfiguration): prominent warn — the GA ID must never be in the dev env file; dev traffic should never be tracked. GA tracking is still skipped.
3. **Production, ID absent** (misconfiguration): warn — the fallback hardcoded ID is being used; the var is missing from `.env.production` or was not injected by the CI/CD environment.
4. **Production, ID present** (correct): no warning.

## Functional Requirements

- In development, when `REACT_APP_GA_ID` is **not set**: emit a `console.warn` stating GA tracking is intentionally disabled in dev, and reminding the developer to verify the ID is present in `.env.production` for production builds.
- In development, when `REACT_APP_GA_ID` **is set** (someone added it to `.env`): emit a prominently worded `console.warn` stating that the GA ID must not be in the dev env file and that dev traffic must never be tracked. GA tracking must still be skipped.
- In production, when `REACT_APP_GA_ID` is **not set**: emit a `console.warn` stating the fallback hardcoded ID is being used and the var is missing from `.env.production`. GA tracking still works via the fallback.
- In production, when `REACT_APP_GA_ID` **is set**: emit no warning.
- GA tracking must always be disabled in development, regardless of whether the ID is set or not.
- GA tracking must always be enabled in production (using the env var ID when set, using the hardcoded fallback otherwise).

## Possible Edge Cases

- The dev bundle has no access to `.env.production` at runtime — the "check `.env.production`" reminder in the dev warning is a message only, not a runtime verification.
- The production warning fires in the browser console after deploy, not at build time — it won't block CI.

## Acceptance Criteria

- Dev server (`npm run serve`), ID not set: `console.warn` appears, is clearly informational, and mentions verifying `.env.production`.
- Dev server, ID set in `.env`: a prominently worded `console.warn` appears stating the ID should not be in the dev env. GA tracking is still skipped.
- Production build, ID set: no GA-related warning in the browser console.
- Production build, ID not set: `console.warn` appears stating the fallback hardcoded ID is in use and `REACT_APP_GA_ID` is missing from `.env.production`.
- GA is never active in development in any case.
- GA is always active in production in any case.

## Open Questions

- None.

## Testing Guidelines

There are no automated tests in this project. Verify manually:
- Dev, ID absent (default): run `npm run serve`, open browser console, confirm informational warning with `.env.production` reminder.
- Dev, ID present: temporarily add `REACT_APP_GA_ID` to `.env`, run dev server, confirm prominent warning appears and no GA network request is made.
- Production, ID present (default): run `npm run build`, serve `dist/`, confirm no GA warning in console.
- Production, ID absent: temporarily remove `REACT_APP_GA_ID` from `.env.production`, run `npm run build`, serve `dist/`, confirm fallback warning appears and GA still fires.

## Clarifications

- User confirmed `.env.override` was a mistake — they meant `.env.production`.
- User wants all four warning scenarios covered: dev/absent, dev/present, production/absent, production/present.
- Dev warning when ID is set in `.env` should be prominently worded — dev should never be tracked under any circumstances.

## Analysis

### Affected Files

**`src/Head/Head.jsx`** — only file to change. The `addGoogleAnalyticsScript` function needs updated logic to handle all four scenarios with the appropriate warning for each.

### Risks & Concerns

- **No breaking changes**: GA tracking behavior (enabled/disabled, fallback ID) is unchanged — only warnings are added or reworded.
- **Production warning is browser-console only**: it does not block the build or break tracking.
- **Dev bundle cannot read `.env.production`**: the "check .env.production" note in the dev warning is advisory text only.

### Decisions

- Use `console.warn` for all cases — consistent severity, visible but not fatal.
- "Prominent" for the dev/ID-present case means strong wording (e.g. uppercase emphasis or a clear `⚠️` marker in the message text), since emojis are acceptable in console output.
- Keep the `[WorldInterests]` prefix for consistency.
- GA is always skipped in dev regardless of the ID being present or not — the branch returns early after any dev warning.

## Implementation Plan

- [x] Step 1: Update `src/Head/Head.jsx` — replace the single `if` condition in `addGoogleAnalyticsScript` with the four-scenario logic: dev/absent (informational warn + return), dev/present (prominent warn + return), production/absent (warn, continue with fallback ID), production/present (no warn, continue with env var ID).
