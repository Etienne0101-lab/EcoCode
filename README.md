# EcoCode

Working website for EcoCode LLC — Connected City & Environmental Intelligence.

Live site: https://etienne0101-lab.github.io/EcoCode/

## What's here

This repository holds the full EcoCode CityPilot project, exported from Replit:

- `artifacts/ecocode-site/` — the public website (Vite + React). Source of the live site.
- `artifacts/api-server/` — Express API server (runs on a host with Node + Postgres; not part of the static site).
- `artifacts/mockup-sandbox/` — design mockup sandbox used during site development.
- `lib/` — shared workspace packages (API client, API spec, DB schema).
- `docs/` — the built website served by GitHub Pages (built from `artifacts/ecocode-site`).

## Rebuilding the site

```sh
pnpm install
PORT=4173 BASE_PATH=/EcoCode/ NODE_ENV=production pnpm --filter @workspace/ecocode-site run build
# copy artifacts/ecocode-site/dist/public/* into docs/ and refresh docs/404.html from docs/index.html
```
