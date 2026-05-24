# Trim — URL shortener with analytics

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)

A full-stack URL shortener that turns long links into short slugs and tracks
every click. Each link gets its own dashboard: traffic over time, geographic
breakdown, top referrers, and device/browser splits.

Redirects are served through a **Redis cache-aside layer** so they stay fast
under load, while **PostgreSQL** durably stores links and per-click events.

---

## Screenshots

> Drop screenshots or a short demo GIF into `docs/` and reference them here, e.g.
> the create page, the link list, and a per-link analytics view.

<!-- ![Create a link](docs/create.png) -->
<!-- ![Analytics dashboard](docs/analytics.png) -->

## Features

- **Instant short links** — auto-generated slugs or custom aliases
- **Fast redirects** — Redis cache-aside, with graceful fallback to Postgres
- **Per-link analytics**
  - clicks over time (30-day time series)
  - country breakdown (offline GeoIP; edge-header aware on Vercel/Cloudflare)
  - top referrers
  - device and browser splits
- **Privacy-conscious** — raw IP addresses are never stored, only the derived country
- **JSON API** for creating links and reading stats
- **Typed end-to-end** — schema, queries, and components share types via Drizzle + TypeScript

## How it works

```
                   ┌─────────────┐
   GET /:slug ───▶ │  redirect   │ ──▶ Redis     (slug → URL, hot path)
                   │   handler   │ ──▶ Postgres   (cache miss → backfill)
                   └──────┬──────┘
                          │ after() — runs once the response is sent
                          ▼
                   ┌─────────────┐
                   │   clicks    │   geo + referrer + user-agent parsed,
                   │  (events)   │   one row per redirect
                   └─────────────┘

   /dashboard            grouped aggregate queries over the clicks table
   /dashboard/:slug ──▶  (by day / country / referrer / device / browser)
```

### Design decisions

A few choices worth calling out, since they shape how the code reads:

- **Cache-aside, not write-through.** The redirect reads Redis first and only
  touches Postgres on a miss, then backfills the cache. If Redis is unavailable
  the request degrades to a direct DB read instead of failing.
- **Analytics never slow the redirect.** Click recording runs in
  `after()` (`next/server`), so the 302 is returned before the insert happens.
- **No raw IPs.** Only the resolved country is persisted; the IP is used
  transiently for the lookup and discarded.
- **Zero-filled time series.** The day-by-day query fills empty days with `0`
  server-side, so the chart never has gaps.
- **Unambiguous slugs.** The slug alphabet drops look-alike characters
  (`0/O`, `1/l/I`) so links are easy to read aloud and retype.
- **Server Components query the database directly**; Client Components are used
  only where interactivity is needed (the form, the chart, copy-to-clipboard).

## Tech stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 15 (App Router), React 19, TypeScript     |
| Styling    | Tailwind CSS                                       |
| Database   | PostgreSQL via Drizzle ORM                         |
| Cache      | Redis (ioredis)                                    |
| Charts     | Recharts                                           |
| Geo / UA   | geoip-lite (offline dataset), ua-parser-js         |
| Tests      | Vitest                                             |

## Getting started

**Requirements:** Node 20+ and Docker (for local Postgres + Redis).

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres + Redis
docker compose up -d

# 3. Configure environment
cp .env.example .env

# 4. Apply the database schema
npm run db:migrate

# 5. (optional) Load demo links and clicks
npm run seed

# 6. Run the app
npm run dev
```

Open <http://localhost:3000> to create a link, then visit
<http://localhost:3000/dashboard> to explore the analytics. If you ran the seed
step, three demo links are already populated with a month of click data.

## Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start the dev server                     |
| `npm run build`       | Production build (standalone output)     |
| `npm start`           | Run the production build                 |
| `npm test`            | Run the test suite                       |
| `npm run db:generate` | Generate a SQL migration from the schema |
| `npm run db:migrate`  | Apply pending migrations                 |
| `npm run db:studio`   | Open Drizzle Studio                      |
| `npm run seed`        | Insert demo links and click data         |
| `npm run lint`        | Lint                                     |

## Testing

Unit tests cover the pure logic that backs the app — slug generation and
validation, URL normalization, GeoIP resolution and header precedence,
user-agent parsing, and country labelling:

```bash
npm test
```

```
 ✓ tests/url.test.ts      (3)
 ✓ tests/slug.test.ts     (6)
 ✓ tests/country.test.ts  (3)
 ✓ tests/ua.test.ts       (4)
 ✓ tests/geo.test.ts      (7)
```

## API

```http
POST /api/links
{ "url": "https://example.com/long/path", "customSlug": "promo" }
→ 201 { "slug": "promo", "targetUrl": "...", "createdAt": "..." }
→ 400 invalid URL / bad alias   ·   409 alias already taken

GET /api/links
→ 200 { "links": [{ slug, targetUrl, createdAt, clickCount }] }

DELETE /api/links/:slug
→ 204 link and its click events deleted   ·   404 unknown slug

GET /api/stats/:slug
→ 200 { link, totalClicks, byDay[], countries[], referrers[], devices[], browsers[] }
→ 404 unknown slug

GET /:slug
→ 302 redirect to the target URL (records a click)
```

## Project structure

```
src/
  app/
    page.tsx                  # create-link form
    [slug]/route.ts           # redirect + click recording (cache-aside)
    dashboard/page.tsx        # link list
    dashboard/[slug]/page.tsx # per-link analytics
    api/links/route.ts        # create / list links
    api/stats/[slug]/route.ts # aggregated stats
  components/                 # form, chart, breakdown list, copy button
  lib/                        # db, redis, schema, slug/url/geo/ua/stats helpers
tests/                        # Vitest unit tests
drizzle/                      # generated SQL migrations
scripts/                      # migrate + seed
docker-compose.yml            # local Postgres + Redis
Dockerfile                    # multi-stage production image
```

## Deployment

### Docker

The app builds to a standalone server and ships as a small multi-stage image:

```bash
docker build -t trim .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://user:pass@host:5432/db \
  -e REDIS_URL=redis://host:6379 \
  -e NEXT_PUBLIC_BASE_URL=https://your-domain \
  trim
```

> The image bundles the offline GeoIP dataset (~160 MB), which makes country
> resolution work anywhere with no API key. On platforms that provide a geo
> header (see below), that dataset is optional.

### Vercel

Deploy the repo to Vercel and point the environment variables at managed
services — for example **Neon** or **Supabase** for Postgres and **Upstash**
for Redis (`REDIS_URL` accepts a `rediss://` TLS URL). Country resolution
automatically prefers the `x-vercel-ip-country` / `cf-ipcountry` edge header
when present, falling back to the bundled dataset otherwise.

## Configuration

| Variable               | Description                            |
| ---------------------- | -------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string           |
| `REDIS_URL`            | Redis connection string                |
| `NEXT_PUBLIC_BASE_URL` | Origin used when rendering short links |
