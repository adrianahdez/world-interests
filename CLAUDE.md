# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- `npm run serve` — webpack-dev-server on port 9000 with HMR (what the Docker dev container runs)
- `npm run dev` — watch-only build to `dist/`, no HTTP server
- `npm run build` — one-off production build to `dist/`
- Docker workflow (primary): `docker compose -f compose.dev.yml up -d` starts the container, which runs `npm install && npm run serve`
- **The dev container runs in watch mode with HMR** — do NOT run `npm run build` after every change; webpack rebuilds and the browser updates automatically.

There are no tests or linting configured in this project.

## Environment

- Requires a `.env` file with `REACT_APP_BACKEND_API_URL` (loaded via dotenv-webpack). Copy from `.env.example`, which defaults to `http://localhost:8080/` (the backend's local Docker port)
- Deployed to Cloudflare Pages from `dist/` on push to `main`; `REACT_APP_BACKEND_API_URL` must be set in the Cloudflare Pages dashboard so it's available at build time
- The `_redirects` file maps the old `world-interests.pages.dev` domain to `worldinterests.midri.net`

## Sitemap

- `npm run generate-sitemap` — fetches the category list from the backend API and rewrites `sitemap.xml` and `robots.txt` in the repo root
- Run this whenever categories are added or removed in the backend, then **commit both files** so the changes deploy with the next push to `main`
- Requires the backend to be running and `REACT_APP_BACKEND_API_URL` to be set in `.env`
- `REACT_APP_SITE_URL` in `.env` controls the domain written into the sitemap and robots.txt (falls back to the hardcoded production URL if unset, with a warning)
- This script is a dev tool only — it does **not** run automatically during `npm run build` or on Cloudflare Pages

## Architecture

React 18 app using Leaflet (via react-leaflet) to display an interactive world map showing trending YouTube content per country, categorized by topic (Music, Gaming, etc.).

### Data Flow

1. **App** (`src/App/App.jsx`) manages the selected category (synced to URL `?category=` param) and coordinates sidebar/dialog state
2. **Map** (`src/Map/Map.jsx`) fetches data from the backend PHP API (`get-json.php?category=<slug>`) when the category changes, then renders country polygons and custom markers
3. **Categories** (`src/Categories/Categories.jsx`) fetches the category list from the backend (`get-category-list.php`); categories are bilingual (EN/ES) and returned as `{en: {slug: name}, es: {slug: name}}`
4. **Data utilities** (`src/Map/Points/Data.js`) handle API fetching and country coordinate lookups using a static JSON mapping of alpha-2/alpha-3 codes to lat/lon/flags
5. **Countries** (`src/Map/Countries/Countries.jsx`) renders GeoJSON polygons with click-to-center behavior

### Context Providers

- **LanguageContext** — toggles between English and Spanish (`isEs` boolean, persisted in localStorage)
- **ThemeContext** — toggles dark/light mode (`isDarkMode` boolean, persisted in localStorage; dark is default)

### Component Organization

Each component lives in its own folder with a colocated `.scss` file. Global styles are in `src/GlobalStyles/`. The entry point is `src/index.js` which lazy-loads `App`.

### Backend

The backend is a separate private repo ([world-interests-backend](https://github.com/adrianahdez/world-interests-backend)). This frontend only consumes its PHP API endpoints.
