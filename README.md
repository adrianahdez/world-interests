# What is this?

A frontend app developed in React that displays the main interests around the world on an interactive map, categorized by various topics.

The data is obtained from the YouTube API, so you can see the most popular channels and trending videos in each country in real-time.

### Categories:

* Music
* Gaming
* Film & Animation
* Autos & Vehicles
* Pets & Animals
* Sports
* Short Movies
* Travel & Events
* Videoblogging
* People & Blogs
* Comedy
* Entertainment
* News & Politics
* Howto & Style
* Education
* Science & Technology
* Movies
* Anime/Animation
* Action/Adventure
* Classics
* Documentary
* Drama
* Family
* Foreign
* Horror
* Sci-Fi/Fantasy
* Thriller
* Shorts
* Shows
* Trailers

# See it in action

[Go to website](https://worldinterests.midri.net/) and enjoy!

[Backend repository](https://github.com/adrianahdez/world-interests-backend) (private).

# Local development

### Prerequisites

The frontend fetches data from the backend API. Make sure the backend is running before starting the frontend. See the [backend repo](https://github.com/adrianahdez/world-interests-backend) for setup instructions — by default it runs at `http://localhost:8080`.

### Environment

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

The default `.env.example` points to `http://localhost:8080/` (the backend's local Docker port). See `.env.example` for the production URL.

### With Docker

Requires only Docker — no local Node.js installation needed.

```bash
# Start the dev server (installs deps on first run, then starts webpack-dev-server)
docker compose -f compose.dev.yml up

# Stop the container
docker compose -f compose.dev.yml down
```

The app will be available at http://localhost:9000. The webpack-dev-server **watches all source files** (JSX, SCSS, JS, etc.) — any change you save is recompiled instantly and the browser updates automatically via Hot Module Replacement (HMR), no manual refresh needed.

To run a one-off production build to `dist/` (only needed if you want to inspect the production output locally — not required for day-to-day development):

```bash
docker compose -f compose.dev.yml run --rm worldinterests_frontend npm run build
```

> **Note:** The first `docker compose up` takes longer because `npm install` runs from scratch inside the container. Subsequent runs reuse the cached `node_modules` volume and start much faster.

### Without Docker

Requires Node.js and npm installed on the host.

```bash
npm install
npm run serve   # starts webpack-dev-server at http://localhost:9000 with file watching and HMR
```

Other useful commands:

- `npm run dev` — development build with file watcher (outputs to `dist/`, no HTTP server)
- `npm run build` — one-off production build to `dist/`

## Deployment

When pushed to the `main` branch, the `dist` folder is automatically deployed to Cloudflare Pages.