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

# Run the project

### Without Docker

1. Clone the repository and step into the project folder with terminal.
2. Copy `.env` and set your backend URL:
   ```
   REACT_APP_BACKEND_API_URL=https://your-backend-url/
   ```
3. Run `npm install` to install the dependencies.
4. Run `npm run dev` to build with a file watcher, or `npm run build` for a one-off production build.

The dev build outputs to `dist/` but does **not** start a web server. Open the built `dist/index.html` directly in a browser or serve it with any static file server.

When push to the `main` branch, the `dist` folder will be automatically deployed to Cloudflare Pages.

---

### With Docker (Apache)

This option builds the project and serves the `dist/` folder via an Apache container.

1. Copy `.env` and set your backend URL (same as above).
2. Create a `docker-compose.yml` at the root of the project:

```yaml
services:
  app:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    command: sh -c "npm install && npm run build"

  web:
    image: httpd:2.4-alpine
    ports:
      - "8080:80"
    volumes:
      - ./dist:/usr/local/apache2/htdocs
    depends_on:
      app:
        condition: service_completed_successfully
```

3. Run the build and start Apache:
   ```bash
   docker compose up
   ```

4. Open `http://localhost:8080` in your browser.

> **Note:** Every time you change source files, re-run `docker compose up --build` to rebuild the `dist/` folder. The `app` service exits after the build completes; only `web` stays running.