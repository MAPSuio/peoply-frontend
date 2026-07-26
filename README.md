# Peoply frontend

Next.js app for [peoply.app](https://peoply.app), the event calendar for the
Department of Informatics at UiO. Pages Router, TypeScript, SCSS modules, SWR.
All data comes from the Peoply backend — this app owns no database.

| | Repo | Local | Prod |
| --- | --- | --- | --- |
| Frontend | you are here | `http://localhost:3001` | `https://peoply.app` |
| Backend | [`MAPSuio/peoply-backend`](https://github.com/MAPSuio/peoply-backend) | `http://localhost:3000` | `https://api.peoply.app` |

Node >= 20.9.0, npm >= 8 (`engines` in `package.json`). Older Node installs fine
and then fails during build in ways that are hard to read — check `node -v` first.

## Run the frontend

```bash
npm ci        # not npm install — see CONTRIBUTING.md
npm run dev   # http://localhost:3001
```

No config needed. `.env.development` is committed and already points at
`http://localhost:3000`, so `npm run dev` talks to a local backend out of the box.

Without a backend running the app renders, but every request fails and you get
the "Noe gikk galt" snackbar on most pages. For anything beyond static markup you
need the backend too.

## Run the backend alongside it

Full setup is in the [backend README](https://github.com/MAPSuio/peoply-backend#readme).
Short version — needs Docker for the local Postgres:

```bash
git clone https://github.com/MAPSuio/peoply-backend.git
cd peoply-backend
nvm use && npm ci
cp .env.example .env
docker compose -f dev-db/docker-compose.yml up -d
npx prisma migrate dev
npm run seed:dev-db     # local users, organizations, events
npm run dev             # http://localhost:3000
```

Documentation for the API is at <http://localhost:3000/api>.

The ports are not interchangeable. Auth cookies are cross-origin, so the backend
must trust this app's exact origin. Both values are already in the backend's
`.env.example`:

```bash
CORS_ORIGIN="http://localhost:3001"    # allowlist; wrong value = browser silently drops the auth cookie
FRONTEND_URL="http://localhost:3001"   # redirect target after login
```

If you move the frontend off 3001, change both and restart the backend.

## Log in locally

Vipps and Google login do not work against localhost. The backend has a dev-only
mock flow instead — set `LOCAL_AUTH_ENABLED=true` in the backend `.env` before
`npm run dev`. It is disabled in production.

Open this **in the browser** to log in as a seeded user. It sets the cookie and
redirects back to the frontend:

```text
http://localhost:3000/auth/dev-login?email=Kristian@gmail.com
```

List the seeded users with `curl http://localhost:3000/auth/dev-users`.

`curl -c cookies.txt` logs in `curl`, not your browser — use the URL above when
you want the UI logged in.

## Environment variables

`.env.development` and `.env.production` are committed on purpose: they hold only
public values that ship to the browser anyway. Nothing secret belongs in this repo.

| Variable | | Local value |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_BASE_URL` | This app's own URL — share links, OG tags, ICS feeds | `http://localhost:3001` |
| `BLOB_DOMAIN` | Remote host allowlisted for `next/image` | `peoply.blob.core.windows.net` |
| `API_INTERNAL_URL` | Prod only, server-side. Lets SSR bypass Cloudflare bot protection; falls back to the public URL when unset | — |

Production values live in the DigitalOcean App Platform spec, not here.

## Layout

| | |
| --- | --- |
| `pages/` | Routes (Pages Router). `pages/api/calendar/[eid].ts` is the only server route — it proxies ICS files |
| `components/` | Shared components. `inputs/` for form controls, `svgs/` for inline icons |
| `hooks/` | Context providers and data hooks — `useUser`, `useNotifications`, `useSnack`, `useOrganization` |
| `services/` | Everything that talks to the API. Start at `fetchers.ts` |
| `styles/` | One `*.module.scss` per component, plus `globals.scss` and the `_variables`/`_mixins`/`_themes` partials |
| `utils/`, `types/`, `constants/` | Helpers, shared types, static data |
| `test/` | Vitest + Testing Library specs |

## How data fetching works

`services/fetchers.ts` is the single entry point to the API, and `SwrProvider`
wires it in as SWR's global fetcher — so most components just call
`useSWR("/events")` with no fetcher argument.

Three things it does that will bite you if you bypass it:

- **401 retry.** A 401 triggers `refreshAccessToken()` once and replays the
  request. Concurrent 401s in one tab share a single refresh call.
- **Errors are `Response` objects, not `Error`s.** `fetchers` throws the raw
  response. `SwrProvider` swallows 401/403/404 and snacks on everything else.
- **Pagination is capped at 100.** The API rejects a larger `take` with a 400
  rather than clamping it. Use `fetchAllFromPeoplyApiJson` when a view needs the
  complete set.

## Things worth knowing

- **SCSS.** `_variables` and `_mixins` are auto-injected into every SCSS file by
  `next.config.js` — do not import them again. `_themes.scss` is imported once
  from `globals.scss`; importing it into a module would break theming.
- **Themes.** `next-themes` with three: `light`, `dark`, `night`.
- **Locale.** `nb` only. UI copy is Norwegian.
- **PWA.** `@ducanh2912/next-pwa`, disabled in development. It only appears in a
  production build, so test service-worker changes with `npm run build && npm start`.
  It is a webpack plugin, which is why `dev` and `build` pass `--webpack`. Under
  Turbopack the build still succeeds but emits no `sw.js` — see `next.config.js`.
- **Analytics.** Umami (loaded in `pages/_app.tsx`, website ID
  `7ec1d359-0bab-4bee-b214-d6f116701233`) plus Vercel Analytics. Anonymized — the
  user-facing wording about this lives in `pages/faq.tsx`. Temporary Umami owner
  until a team account exists: `victor.uhnger@gmail.com`.

## Scripts

| | |
| --- | --- |
| `npm run dev` | Dev server on 3001 |
| `npm run build` / `npm start` | Production build and serve |
| `npm test` / `npm run test:watch` | Vitest |
| `npm run lint` | Biome (JS/TS) + Stylelint (SCSS) |
| `npm run format` | Applies Biome's fixes |
| `npx tsc --noEmit` | Type check |

Those four checks — type check, lint, test, build — are exactly what CI runs, and
a red job blocks both merge and deploy. Run them before pushing.

## More

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branching, commit format, CI, deploys
- [`HALL_OF_FAME.md`](HALL_OF_FAME.md) — everyone who built this before the move
  to the `MAPSuio` organization
