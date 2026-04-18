# Spec for SEO And Performance Optimization

branch: feature/WIF-14-SEO-And-Performance-Optimization

## Summary

The application has received no intentional SEO treatment since launch. As a SPA (React + Leaflet) deployed on Cloudflare Pages, it is largely invisible to search engines: the initial HTML shell contains no meaningful content, meta tags, structured data, or social sharing metadata. This ticket covers a full SEO and performance audit and implementation to make the app discoverable, indexable, and competitive in search rankings. The app displays real-time trending YouTube videos and channels on a world map by category, along with historical popularity data by country — content that has genuine search demand that is currently unreachable.

## Functional Requirements

- The `<head>` must include a descriptive `<title>`, `<meta name="description">`, canonical URL, and robots directives appropriate for a SPA.
- Open Graph and Twitter Card meta tags must be present so sharing on social platforms renders a meaningful preview (title, description, image, URL, type).
- A `sitemap.xml` must exist at the root domain and list all addressable URLs. For a SPA with category and language URL params, this means all category/language combinations.
- A `robots.txt` must exist at the root domain and reference the sitemap.
- The app must declare Schema.org structured data (JSON-LD) appropriate to its content: at minimum `WebApplication` and `Dataset` types; optionally `VideoObject` for surfaced trending videos.
- All page-level meta (title, description, canonical) must update dynamically when the user changes category or language, so that prerenderers and social crawlers see the correct content per URL.
- The `index.html` entry point must include meaningful fallback static content (not just `<div id="root"></div>`) so crawlers that do not execute JavaScript receive at least a descriptive text representation of the page.
- Semantic HTML must be used throughout: landmark elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`), heading hierarchy, and descriptive `aria-label` attributes where interactive elements lack visible text.
- All images must have descriptive `alt` attributes. Country flag images and channel thumbnails are a known gap.
- Lazy loading must be applied to off-screen images (channel thumbnails, flag images) using the `loading="lazy"` attribute or equivalent.
- Code splitting must ensure the initial JS bundle does not block First Contentful Paint; non-critical components should load asynchronously.
- The app must pass Core Web Vitals thresholds (LCP < 2.5 s, CLS < 0.1, INP < 200 ms) as measured in a Lighthouse audit on the production URL.
- If the app supports both English and Spanish (it does via `LanguageContext`), `hreflang` link tags must be present and switch correctly with language toggling.
- Internal navigation between categories must use `<a>` elements (or equivalent with proper `href`) rather than click handlers alone, so link equity flows and crawlers can follow category links.
- The `<html lang>` attribute must reflect the active language at render time.

## Possible Edge Cases

- Cloudflare Pages serves a static file; any server-side rendering or dynamic rendering solution must work within a static-hosting constraint (e.g., prerendering at build time, or a Cloudflare Worker for bot detection and cached snapshot serving).
- The category list is fetched at runtime from the backend API. A sitemap generated at build time must either hardcode known category slugs or call the API during the build step.
- Language switching is managed via `localStorage` and context, not via distinct URLs or subpaths. Deciding whether to encode language in the URL (e.g., `?lang=es`) affects both the hreflang strategy and the sitemap structure.
- Some category slugs or names may be bilingual or change over time; the sitemap and meta tags must handle missing or renamed categories gracefully.
- Structured data for `VideoObject` would ideally include real video metadata (title, thumbnail, channel), but this data is fetched dynamically. A static or SSR prerender may only capture a snapshot.
- The Leaflet map canvas is not accessible to screen readers or crawlers; descriptive alternative content must be provided without removing the map.
- CLS can be introduced by dynamically injected meta tags or layout shifts from lazy-loaded images that lack explicit dimensions.

## Acceptance Criteria

- Running `lighthouse --url <production-url> --output json` (or equivalent) produces a score ≥ 80 for SEO and ≥ 70 for Performance.
- The Google Rich Results Test (or `npx schema-dts-validator`) confirms valid structured data JSON-LD.
- Sharing the production URL on Slack, Twitter, and Facebook renders the correct OG preview image and description.
- `curl -A "Googlebot" <production-url>` returns an HTML response containing the page title, description, and at least one human-readable paragraph about the app's purpose (not just `<div id="root"></div>`).
- `https://worldinterests.midri.net/sitemap.xml` returns a valid XML sitemap listing at least one URL per category.
- `https://worldinterests.midri.net/robots.txt` returns a valid robots file that references the sitemap and does not disallow Googlebot.
- Changing category via the UI updates `document.title` and the `<meta name="description">` content within the same navigation event.
- An automated accessibility check (axe-core or Lighthouse) reports zero violations for missing `alt` attributes on visible images.
- The `<html>` element has a `lang` attribute that matches the active language.

## Open Questions

- **Language in URL**: Should language be encoded in the URL (e.g., `?lang=es`) to make each language a distinct indexable URL? This is a prerequisite for proper `hreflang` and a bilingual sitemap. Currently language lives only in `localStorage`.
- **Prerendering vs. dynamic rendering**: Should we prerender pages at build time (e.g., with `react-snap` or a Cloudflare Pages build plugin), or implement a Cloudflare Worker that serves a cached snapshot to bots? The chosen approach affects build complexity and content freshness.
- **OG image**: Is there an existing branded image to use as the Open Graph image, or does one need to be created?
- **Sitemap generation**: Should category slugs for the sitemap be hardcoded (known at commit time) or fetched from the live backend API during the build step?
- **Structured data scope**: Should `VideoObject` structured data be included only when a specific video detail is shown, or should a representative set of trending videos be included in the initial page load?

## Clarifications

### Q1 — Language in URL
**Decision: Option A.** Language stays in `localStorage` only — no `?lang=` URL parameter. A single canonical URL per category is enough for Google's JavaScript indexer to discover and index the English content. Adding the URL param would require threading it through every `history.pushState` call, all category links, and the sitemap — significant complexity for a moderate SEO gain. Can be revisited as a future enhancement.

### Q2 — Prerendering / Bot Crawlability
**Decision: Option C.** No SSR or prerendering. Google executes JavaScript for SPAs and indexes the rendered content. We compensate with a meaningful `<noscript>` fallback in `index.html` and rich static meta content in `<head>`. This is sufficient for a non-news SPA.

### Q3 — OG Image
`screenshot.jpg` at the repo root is already wired in `Head.jsx` and copied to `dist/` by webpack. The file is currently outdated (visually). Replacing it is a **manual step outside this implementation**: take a new screenshot at 1200×630 px and overwrite `screenshot.jpg` in the repo root. No code changes needed.

### Q4 — Sitemap generation
`generate-sitemap.js` is a standalone `npm run generate-sitemap` dev script. It does **not** hook into `npm run build` or the Cloudflare Pages pipeline, so it never blocks a deploy. The developer runs it manually before pushing when categories change. On failure, the script logs a clear `[sitemap] ERROR:` message and exits with code 1 for awareness — but the deploy is unaffected.

### Q5 — Structured data scope
**Decision: Option A.** `WebApplication` + `Dataset` JSON-LD only. `VideoObject` is skipped because the video data is fetched client-side after mount — crawlers that don't fully execute JS won't see it, making it unreliable and a potential source of inaccurate markup.

### Q6 — Head / html[lang] management
**Decision: Option A.** Extend the existing direct-DOM pattern in `Head.jsx`. `html[lang]` updated via `document.documentElement.lang` in `LanguageContext.jsx`. No new dependencies. Migration to `react-helmet-async` later is bounded to one file.

### Q7 — Category link hrefs
Category links in `Categories.jsx` updated from `href="#"` to `href="?category=<slug>"`. This clears `country` and `channel` params on follow (consistent with current category-switch behavior), which is correct — those params are category-specific views.

---

## Analysis

### Affected Files

**New files**
- `robots.txt` — crawl rules and sitemap reference
- `scripts/generate-sitemap.js` — standalone sitemap generation script

**Modified files**

*SEO foundation*
- `index.html` — keyword-rich title, static description/robots meta, `<noscript>` fallback, preconnect hints
- `webpack.config.js` — add `robots.txt` to `CopyPlugin` patterns

*Head / meta system*
- `src/Head/Head.jsx` — canonical link, hreflang, JSON-LD, per-category dynamic title/description, duplicate-tag fix, `isEs`/`categoryName` reactivity; receives new `category` + `categoryName` props
- `src/App/App.jsx` — pass `category` and `categoryName` props to `<Head />`
- `src/Common/LanguageContext.jsx` — sync `document.documentElement.lang` on mount and language toggle

*Navigation / crawlability*
- `src/Categories/Categories.jsx` — `href="#"` → `href="?category=<slug>"` on all category links

*Semantic HTML*
- `src/Header/Header.jsx` — wrap in `<header>` landmark
- `src/Footer/Footer.jsx` — wrap in `<footer>` landmark
- `src/InfoSidebar/InfoSidebar.jsx` — wrap in `<aside>` with descriptive `aria-label`
- `src/CountryPanel/CountryPanel.jsx` — confirm/reinforce `<aside>` usage and heading hierarchy
- `src/App/App.jsx` — wrap map region in `<main>`

*Image accessibility*
- `src/CustomMarker/CustomMarker.jsx` — fix `alt="marker"` to use channel title; confirm `loading="lazy"`
- `src/InfoSidebar/InfoSidebar.jsx` — verify alt text on channel/video images and `loading="lazy"`
- `src/CountryPanel/CountryPanel.jsx` — verify alt text on channel images

*Sitemap*
- `package.json` — add `"generate-sitemap"` script entry
- `sitemap.xml` — updated output from the script (committed as baseline)

### Risks & Concerns

- **`Head.jsx` useEffect bug (existing):** The meta-tag effect runs with `[]` deps, so it never re-fires when `isEs` changes. Language switching currently leaves stale English OG/Twitter tags in the DOM. The fix is to add `isEs` and `categoryName` to the effect deps and use `querySelector` to upsert (not append) each tag.
- **Duplicate tag accumulation:** `removeMetaTags()` currently only cleans the OG/Twitter tags. `description`, `keywords`, and `robots` meta tags are appended on mount and leaked on unmount. The cleanup function must be extended to cover all managed tags.
- **`Head.jsx` receives no props today:** `App.jsx` renders `<Head />` with no props. `categoryName` is available in App state but not passed down. This must be added in the same step as the Head rewrite to avoid a broken intermediate state.
- **Canonical URL and `?country=` / `?channel=` params:** These params represent panel state, not distinct content pages. The canonical URL should strip them (keep only `?category=`). Incorrect canonicals could cause duplicate content signals.
- **hreflang with Option A (same URL for both languages):** Declaring `hreflang="en"` and `hreflang="es"` both pointing to the same URL is valid and tells Google the page serves both languages. It is less authoritative than distinct URLs but correct and harmless.
- **Semantic HTML refactor scope:** Adding `<main>`, `<header>`, `<footer>`, `<aside>` should not affect any visual layout (these are semantic wrappers), but if any SCSS is scoped to `div.app-container` children by tag type rather than class, it could break. Must verify no SCSS tag-type selectors conflict.
- **`screenshots.jpg` not updated:** Until the developer replaces the file, the OG image will show an outdated UI. This is cosmetic, not a blocking correctness issue.
- **Sitemap categories hardcoded as baseline:** The committed `sitemap.xml` will reflect the categories at the time the developer last ran `generate-sitemap`. It will drift if categories change and the script isn't re-run. This is acceptable given the non-blocking decision.

### Decisions

- **No URL-based language param:** Language stays in localStorage. Google indexes English. Simplicity wins over bilingual indexing at this stage.
- **No SSR/prerendering:** Option C — Google's JS crawler is sufficient. `<noscript>` + rich static `<head>` compensates.
- **Upsert meta tags instead of append:** `Head.jsx` will use `document.querySelector` to update existing tags in place rather than removing-and-recreating. This is cleaner and avoids flash-of-wrong-metadata.
- **Standalone sitemap script, not hooked to build:** Non-blocking per Q4 decision.
- **JSON-LD injected by `Head.jsx` on mount:** Since it describes the application (not dynamic content), it can be a static string. It does not need to re-run on category change.
- **Canonical URL strips panel params:** `?country=` and `?channel=` are stripped from the canonical. `?category=` is preserved since it represents meaningfully distinct content.

---

## Implementation Plan

- [x] Step 1: Static SEO foundation — `index.html`, `robots.txt` (new), `webpack.config.js`
  - Update `<title>` to `World Interests — Trending YouTube Channels by Country`
  - Add static `<meta name="description">` and `<meta name="robots">` fallbacks to `<head>`
  - Add `<link rel="preconnect">` for the YouTube CDN (`ggpht.com`, `i.ytimg.com`) and `<link rel="dns-prefetch">` for the backend domain
  - Add `<noscript>` block with a one-paragraph description of the app
  - Create `robots.txt` at repo root: `User-agent: *`, `Allow: /`, `Sitemap: https://worldinterests.midri.net/sitemap.xml`
  - Add `{ from: 'robots.txt', to: '' }` to `CopyPlugin` patterns in `webpack.config.js`

- [x] Step 2: `Head.jsx` + `App.jsx` — Dynamic meta tag system overhaul
  - Add `category` and `categoryName` as props to `Head`; update `App.jsx` to pass them (`<Head category={category} categoryName={categoryName} />`)
  - Split into two `useEffect` calls: one for GA (empty deps, mount only); one for all meta tags (deps: `[isEs, category, categoryName]`)
  - Replace the append pattern with a `upsertMeta(attrs)` helper that uses `querySelector` to update existing tags in place and creates them only when absent
  - Expand cleanup to remove all managed tags: OG, Twitter, description, keywords, robots, canonical, hreflang, JSON-LD `<script>` tag
  - Add `<link rel="canonical">` pointing to current URL with only the `?category=` param (stripping `?country=` and `?channel=`)
  - Add `<link rel="alternate" hreflang="en">` and `<link rel="alternate" hreflang="es">` both pointing to the canonical URL
  - Add `<script type="application/ld+json">` with `WebApplication` + `Dataset` schema on mount (static, not re-injected on category change)
  - Build dynamic `<title>` and `description` per active category: `"{categoryName} — Trending YouTube on World Interests"` (falls back to static value when categoryName is empty)

- [ ] Step 3: `LanguageContext.jsx` — html[lang] sync
  - Add `useEffect` that sets `document.documentElement.lang = isEs ? 'es' : 'en'` on mount and whenever `isEs` changes

- [ ] Step 4: `Categories.jsx` — Crawlable category links
  - Change `href="#"` to `href={\`?category=\${slug}\`}` on each category `<a>`
  - Verify the existing `onClick` handler (`e.preventDefault()` + `setCategory`) continues to drive SPA navigation correctly and that the new `href` value does not conflict with any other URL params in the browser's address bar

- [ ] Step 5: Semantic HTML landmark pass — `App.jsx`, `Header/Header.jsx`, `Footer/Footer.jsx`, `InfoSidebar/InfoSidebar.jsx`, `CountryPanel/CountryPanel.jsx`
  - `App.jsx`: change the map region wrapper from `<div className='app-container'>` to keep the div but ensure the map area is wrapped in `<main>`; add a visually-hidden `<h1>` for the app name inside `<main>` (screen-reader anchor)
  - `Header/Header.jsx`: confirm or add `<header>` as the root element; add `<nav aria-label="Primary navigation">` around category and settings buttons
  - `Footer/Footer.jsx`: confirm or add `<footer>` as the root element
  - `InfoSidebar/InfoSidebar.jsx`: confirm or add `<aside aria-label="Channel details">` as the root; ensure an `<h2>` is the first heading inside
  - `CountryPanel/CountryPanel.jsx`: confirm or reinforce `<aside>` root; ensure heading hierarchy (`<h2>` panel title, `<h3>` for sub-sections)
  - Verify no SCSS rules use bare tag-type selectors that would break after wrapping elements change

- [ ] Step 6: Image accessibility — `CustomMarker/CustomMarker.jsx`, `InfoSidebar/InfoSidebar.jsx`, `CountryPanel/CountryPanel.jsx`
  - `CustomMarker.jsx`: replace `alt="marker"` with the channel's name (already available in the marker data); add `loading="lazy"` if absent
  - `InfoSidebar.jsx`: audit all `<img>` elements — verify channel avatar has `alt={channel.title}`, video thumbnail has `alt={channel.peak_video.title}`, and `loading="lazy"` is present on both
  - `CountryPanel.jsx`: audit all `<img>` elements — verify descriptive `alt` text and `loading="lazy"` on channel thumbnails

- [ ] Step 7: Sitemap generation script — `scripts/generate-sitemap.js` (new), `package.json`, `sitemap.xml`, `CLAUDE.md`, `README.md`
  - Create `scripts/generate-sitemap.js`: Node.js script that fetches `REACT_APP_BACKEND_API_URL + 'api/categories'`, extracts all category slugs, and writes `sitemap.xml` with one `<url>` entry per category (`/?category=<slug>`) plus the root URL; logs `[sitemap] ERROR:` on failure and exits with code 1 (so the developer notices), but never runs automatically
  - Add `"generate-sitemap": "node scripts/generate-sitemap.js"` to `package.json` scripts
  - Add a `## Sitemap` section to `CLAUDE.md` documenting: what `npm run generate-sitemap` does, when to run it (after adding/removing categories in the backend), that it requires the backend to be running and `REACT_APP_BACKEND_API_URL` to be set in `.env`, and that the output `sitemap.xml` must be committed for it to deploy
  - Add `npm run generate-sitemap` to the "Other useful commands" list in `README.md` under Local development, with a one-line explanation
  - Run `npm run generate-sitemap` locally (requires dev backend running) and commit the updated `sitemap.xml` as the baseline

- [ ] Step 8: Extract production site URL into env var — `.env.production`, `.env.example`, `src/Head/Head.jsx`, `robots.txt`
  - Add `REACT_APP_SITE_URL=https://worldinterests.midri.net` to `.env.production` and `.env.example` (with a comment explaining its purpose)
  - Update `src/Head/Head.jsx`: change `const SITE_URL = 'https://worldinterests.midri.net'` to `const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://worldinterests.midri.net'` — the fallback preserves behaviour if the var is absent
  - Update `robots.txt`: add an inline comment above the Sitemap line noting that the URL here must match `REACT_APP_SITE_URL` in `.env.production` — the file itself stays static (CopyPlugin cannot template-process it), but the comment makes the dependency explicit. The generate-sitemap script (step 7) will also write `robots.txt` dynamically using the env var, so after running the script the file will always be in sync
  - Note: `index.html` noscript link and documentation files (`README.md`, `CLAUDE.md`, `_redirects`) are acceptable hardcoded — they are not app code and do not affect SEO signals

- [ ] Manual action (reminder — no code): Replace `screenshot.jpg` at the repo root with an updated screenshot of the app at 1200×630 px. This file is the OG image shown when sharing the URL on social platforms. Until it is replaced the social preview will show the outdated UI.

## Testing Guidelines

Follow the repository testing guidelines (for example CLAUDE.md, AGENTS.md, or equivalent) and create meaningful tests for the following cases, without going too heavy:

- Meta tags (title, description, canonical) update correctly when the active category changes.
- `<html lang>` attribute reflects the correct language when toggled.
- Structured data JSON-LD is present in the DOM on initial render and is parseable JSON.
- `robots.txt` and `sitemap.xml` are present in the `dist/` output after a production build.
