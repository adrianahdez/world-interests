# Spec for Local Docker Development Environment Setup

branch: chore/WIF-1-Local-Docker-Development-Environment-Setup

## Summary

The frontend app currently has instructions for running locally with Docker, but those instructions are incomplete and incorrect — they embed a `docker-compose.yml` snippet directly in the README rather than shipping an actual compose file, and the setup uses a plain Apache image that doesn't rebuild automatically when source files change. There is no proper development compose file in the repository.

The goal is to create a `compose.dev.yml` at the root of the frontend repo that mirrors the pattern used by the backend (`world-interests-backend`), serves the built `dist/` folder via Apache, and documents the correct local development workflow. The README must also be audited and updated: outdated Docker instructions removed, correct environment variable and backend dependency information added, and the structure aligned with the backend README.

## Functional Requirements

- A `compose.dev.yml` file exists at the root of the `world-interests` repository.
- The compose file builds and serves the frontend app locally via an Apache container.
- The frontend app is accessible at `http://localhost:9000` (to avoid port conflict with the backend, which uses `8080`).
- The compose file reads the `.env` file to pass `REACT_APP_BACKEND_API_URL` to the build process.
- A `.env.example` file exists documenting the required environment variables with placeholder values.
- The README is updated to:
  - Remove the embedded `docker-compose.yml` code block.
  - Add a "Local development" section with Docker and non-Docker options.
  - Document that the backend app must be running first, and how to start it.
  - Reference the backend repo for backend setup instructions.
  - Reflect the correct port (`9000`) used by the dev container.

## Possible Edge Cases

- The `dist/` folder does not exist on first run — the compose setup must build the project before Apache tries to serve it.
- The `node_modules` directory must not be mounted from the host into the container, or package resolution may break on cross-platform setups (Linux host vs. Alpine container).
- Hot-reload/watch mode is not available in this setup (webpack outputs to `dist/` once, Apache serves static files); this limitation must be clearly documented so the developer knows they need to rebuild to see changes.
- If both the frontend and backend compose stacks are running simultaneously, ports `8080` and `9000` must not collide.
- The `REACT_APP_BACKEND_API_URL` value in `.env` must point to the running backend instance (e.g., `http://localhost:8080/`) for the frontend to fetch data correctly during local development.

## Acceptance Criteria

- `compose.dev.yml` exists and `docker compose -f compose.dev.yml up --build` completes successfully.
- After the command completes, `http://localhost:9000` serves the built frontend app.
- The map loads and fetches data correctly when the backend is also running at `http://localhost:8080`.
- A `.env.example` file exists at the repo root with `REACT_APP_BACKEND_API_URL` documented.
- The README no longer contains an embedded `docker-compose.yml` block.
- The README contains clear steps for both Docker and non-Docker local development.
- The README mentions the backend dependency and how to start it.

## Open Questions

- Should the compose file use a multi-stage Dockerfile (Node build → Apache serve), or two separate services (build service + web service) as outlined in the current README draft? The backend uses a single-service Dockerfile approach — should this repo follow the same pattern?
- Should `npm run dev` (watch mode) or `npm run build` (one-off production build) be used inside the container? Watch mode would require a live-reload mechanism that Apache doesn't provide out of the box.
- Is port `9000` acceptable for the frontend dev container, or is there a preferred port?

## Clarifications

1. **Compose approach (Option B — two-service, no Dockerfile):** A single `node:20-alpine` service mounts the project source as a volume so `dotenv-webpack` can read `.env` directly from the host. An anonymous volume at `/app/node_modules` keeps the container's node_modules isolated from the host. No Apache service, no Dockerfile.

2. **npm scripts — both `build` and `dev` remain available, plus a new `serve` script:** `npm run serve` (`webpack serve --mode development --host 0.0.0.0`) starts webpack-dev-server on port 9000 and is the default `compose.dev.yml` command. `npm run build` and `npm run dev` are still usable via `docker compose run`. The `--host 0.0.0.0` flag is required so the dev server inside the container is reachable from the host browser.

3. **Port:** 9000 (already configured in `webpack.config.js`'s `devServer.port`). Backend uses 8080. No conflict, no config changes to the port itself.

## Testing Guidelines

There are no automated tests configured in this project (see CLAUDE.md). Validation is manual:

- `docker compose -f compose.dev.yml up` starts without errors and webpack-dev-server is accessible at `http://localhost:9000`.
- With the backend running at `http://localhost:8080`, the map renders country data.
- Without the backend running, the app shows a graceful error (not a blank page crash).
- `docker compose -f compose.dev.yml run --rm worldinterests_frontend npm run build` completes and writes `dist/` to the host filesystem.

## Analysis

### Affected Files

| File | Action | Purpose |
|------|--------|---------|
| `compose.dev.yml` | Create | Single Node service for local dev: mounts source, installs deps, starts webpack-dev-server |
| `.env.example` | Create | Documents `REACT_APP_BACKEND_API_URL` with a placeholder value |
| `.dockerignore` | Create | Excludes `node_modules`, `dist`, `.git`, IDE dirs, and docs from any future Docker build context |
| `package.json` | Modify | Add `"serve"` script: `webpack serve --mode development --host 0.0.0.0` |
| `README.md` | Modify | Remove embedded `docker-compose.yml` block; rewrite "Run the project" section with Docker and non-Docker instructions, backend dependency note, and correct port |

### Risks & Concerns

1. **`node_modules` isolation:** Without an anonymous volume at `/app/node_modules`, the container's `npm install` could overwrite the host's `node_modules` (or vice versa), breaking local runs. The anonymous volume prevents this.
2. **First-run `npm install` time:** The anonymous volume starts empty, so `npm install` runs from scratch the first time. Subsequent `up` calls reuse the volume and are fast. This must be documented so developers aren't surprised.
3. **`.env` missing on first clone:** `dotenv-webpack` will fail silently or throw if `.env` is absent. The README must make it clear that copying `.env.example` to `.env` is a required step before `docker compose up`.
4. **Webpack-dev-server host binding:** Without `--host 0.0.0.0`, the dev server binds to `127.0.0.1` inside the container and is unreachable from the host browser. The `serve` script must include this flag.
5. **`dist/` is gitignored:** The `npm run build` output is not committed. This is correct — just needs to be clear in the README.
6. **`.env` is gitignored (the dotenv template comment notwithstanding):** The `.gitignore` has `### dotenv ###` but the `.env` line is commented out. The `.env` file is currently tracked (it appears in git status as modified). We should not change gitignore behavior — just ensure `.env.example` documents the variables.

### Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Compose approach | Single Node service, no Dockerfile, no Apache | Simplest possible; dotenv-webpack reads `.env` via volume mount; mirrors user's prior setup |
| Dev server | `webpack serve` (webpack-dev-server) | Already configured in webpack.config.js; provides live reload; single container serves the app |
| Build/watch commands | Available via `docker compose run` | `npm run build` and `npm run dev` remain unchanged; documented in README |
| Port | 9000 | Already in webpack devServer config; no conflict with backend (8080) |

## Implementation Plan

- [x] Step 1: **Add `serve` script to `package.json`.** Add `"serve": "webpack serve --mode development --host 0.0.0.0"` to the `scripts` block. This is the only change to existing application code.

- [x] Step 2: **Create `compose.dev.yml`.** Single service `worldinterests_frontend` using `node:20-alpine`, working dir `/app`, volumes `.:/app` + anonymous `/app/node_modules`, port `9000:9000`, command `sh -c "npm install && npm run serve"`.

- [x] Step 3: **Create `.env.example`.** Single entry: `REACT_APP_BACKEND_API_URL=http://localhost:8080/` with a comment explaining it must point to the running backend.

- [x] Step 4: ~~**Create `.dockerignore`.**~~ Skipped — no Dockerfile means no build context, so `.dockerignore` is unnecessary.

- [x] Step 5: **Rewrite `README.md`.** Remove the "With Docker (Apache)" section including the embedded `docker-compose.yml` block. Rewrite the "Run the project" section into a clear "Local development" section covering: (a) prerequisite — backend must be running, link to backend repo; (b) copy `.env.example`; (c) Docker path (`docker compose -f compose.dev.yml up`, rebuild command, stop command); (d) non-Docker path (existing content, lightly cleaned up). Update port references to 9000 where relevant.
