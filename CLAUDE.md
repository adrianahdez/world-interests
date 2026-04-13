# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- `npm run dev` — development build with file watcher (webpack development mode)
- `npm run build` — production build to `dist/` (webpack production mode)
- Dev server runs on port 9000

There are no tests or linting configured in this project.

## Environment

- Requires a `.env` file with `REACT_APP_BACKEND_API_URL` (loaded via dotenv-webpack)
- Deployed to Cloudflare Pages from `dist/` on push to `main`
- The `_redirects` file maps the old `world-interests.pages.dev` domain to `worldinterests.midri.net`

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
