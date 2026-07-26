# Peoply frontend

Next.js app for [peoply.app](https://peoply.app), the event calendar for the
Department of Informatics at UiO. Pages Router, TypeScript, SCSS modules, SWR.
All data comes from the Peoply backend — this app owns no database.

| | Repo | Local | Prod |
| --- | --- | --- | --- |
| Frontend | you are here | `http://localhost:3001` | `https://peoply.app` |
| Backend | [`MAPSuio/peoply-backend`](https://github.com/MAPSuio/peoply-backend) | `http://localhost:3000` | `https://api.peoply.app` |

Node >= 22.11.0, npm >= 10 (`engines` in `package.json`). `.nvmrc` pins the
version CI builds with, so `nvm use` gets you the same one. Older Node installs
fine and then fails during build in ways that are hard to read — check `node -v`
first.

## Run the frontend

```bash
nvm use                          # reads .nvmrc
npm ci                           # not npm install — see CONTRIBUTING.md
cp .env.example .env.development # local env — see "Environment variables"
npm run dev                      # http://localhost:3001
```

`.env.example` already points at `http://localhost:3000`, so after the copy
`npm run dev` talks to a local backend out of the box.

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

Env files are not committed. Copy the template and you are done — the defaults
point at a local backend:

```bash
cp .env.example .env.development
```

Every variable is documented in `.env.example`. They hold only public values
that ship to the browser anyway; nothing secret belongs in this repo.

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
- **SCSS linting is Stylelint's job alone.** Biome ignores `.scss` outright, so
  all 117 stylesheets are covered only by `npm run lint:stylelint`. Stylelint 16
  dropped its formatting rules on the grounds that a formatter should own them —
  but since no formatter here touches SCSS, `indentation` and `color-hex-case`
  live on via `@stylistic/stylelint-plugin` rather than being dropped. Remove
  that plugin only once something else formats SCSS.
- **Themes.** `next-themes` with three: `light`, `dark`, `night`.
- **Locale.** `nb` only. UI copy is Norwegian.
- **PWA.** Serwist, disabled in development. The service worker source is
  `service-worker/index.ts`; `serwist.config.mjs` decides what gets precached,
  and `npm run build` bundles the two into `public/sw.js` as a step after
  `next build`. It only exists in a production build, so test service-worker
  changes with `npm run build && npm start` — and verify the emitted `sw.js`,
  not the exit code. A build that emits no service worker still exits 0.
  Because it runs as its own CLI step rather than a bundler plugin, it is not
  tied to a bundler — which is what let the build move to Turbopack.
- **Turbopack.** Both `next dev` and `next build` use it; there is no `--webpack`
  flag anywhere any more. It builds roughly twice as fast but emits more, smaller
  chunks, so a first page load costs ~20 kB more gzipped and the precache holds
  215 entries instead of 128. `--webpack` still works as an escape hatch if a
  build ever misbehaves, and `serwist.config.mjs` is written to handle either.
- **TypeScript 7 is the native port, and `next build` needs a flag for it.**
  TS 7 ships the `tsc` CLI but not the JS compiler API, which is what
  `next build` reaches for to run its own type check — without
  `experimental.useTypeScriptCli` in `next.config.js` the build stops at
  "Running TypeScript ..." and exits 1. The flag makes Next shell out to the
  same binary `npm run typecheck` already uses, so the two agree by
  construction rather than by coincidence. It does **not** weaken the check:
  a type error still fails `next build` with exit 1 and emits no service
  worker. Remove the flag only once Next reads TS 7 natively, and verify by
  planting a deliberate type error rather than by the build going green.
- **sharp is force-deduped.** Next declares `sharp@^0.34.5` as an optional
  dependency, and every 0.34.x carries four high-severity libvips CVEs with no
  patched release in that line — the fix only exists in 0.35. The `overrides`
  entry in `package.json` therefore points Next at our own top-level sharp,
  deliberately outside the range it asks for. If Next ever starts using a sharp
  API that 0.35 changed, image optimisation is where it will break, so re-run the
  check that justified this: request `/_next/image?url=...&w=256&q=75` before and
  after and compare the bytes, not just the status code.
- **postcss is force-deduped too.** Next pins `postcss` to exactly `8.4.31`,
  which carries three advisories (one high). `npm audit fix --force` "fixes" them
  by installing `next@9.3.3`, so the `overrides` entry points Next at our own
  copy instead. Both overrides use the `$name` form, which resolves to the
  top-level pin — that is why `postcss` is a devDependency we never import: an
  override written as a literal range is invisible to Dependabot and would sit
  at whatever version it was added at forever. Bumping it owes the same evidence
  sharp does, one directory over: `npm run build` and diff the sha256 of every
  file in `.next/static/**/*.css` against the previous build. Stylelint parses
  with postcss as well, so `npm run lint` is part of that check, not separate
  from it.
- **Analytics.** See [Analytics](#analytics) below.
- **Approving an organization is a manual step** behind a hidden admin page. See
  [Admin: approving organizations](#admin-approving-organizations) below.

## Analytics

One tracker, mounted unconditionally in `pages/_app.tsx`: Umami, as
`<Script src="https://cloud.umami.is/script.js">` with
`data-website-id="7ec1d359-0bab-4bee-b214-d6f116701233"`. Hosted on Umami
Cloud, not self-hosted.

The website ID is not a secret and does not belong in `.env` — it is a public
identifier that ships in the client bundle by design. Umami's own dashboard is
the access control.

**It runs in development.** This is the part that surprises people. The service
worker two bullets up is explicitly disabled outside production
(`disable={process.env.NODE_ENV === "development"}`, same file, ~15 lines above),
but the tracker has no equivalent guard. Every page view on
`localhost:3001` during `npm run dev` is recorded against the production website
ID, indistinguishable from real traffic except by hostname. If that matters
before you spend an afternoon clicking around, wrap the `<Script>` in the same
`NODE_ENV` check the `SerwistProvider` already uses. (Umami also accepts a
`data-domains` attribute for this — untested here, so prefer the `NODE_ENV`
check, which matches the existing pattern in the file.)

Data is anonymized. The user-facing wording about that lives in `pages/faq.tsx`
— if you change what is collected, change that copy too.

The Umami Cloud account is a personal one, `victor.uhnger@gmail.com`, standing in
until a MAPS team account exists. Whoever inherits this: moving the site to a team
account keeps the website ID, so it is a dashboard-side migration with no code
change.

## Admin: approving organizations

Organizations created through `/orgs/create` start with `approved: false`.
Flipping that flag is a manual step, done from a page that is only reachable —
and only useful — if you are a member of the **MAPS** organization.

**Route:** `/me/admin/orgs` (`pages/me/admin/orgs.tsx`). Nothing links to it for
anyone else: `components/ProfileMenu.tsx` renders the "Admin: foreninger" entry
only when the same membership check passes, so a non-MAPS user never sees it.

### The frontend check is UX, not security

`pages/me/admin/orgs.tsx` derives `isMapsMember` from `useUser().orgs` in the
browser, redirects to `/me` when false, and holds the SWR key at `null` so no
request goes out. All of that is bypassable from devtools, and none of it is what
keeps the data safe.

The enforcement is server-side, in the backend's
`organizationsService.ensureMapsMember(req.user.id)`, called as the first
statement of both admin endpoints:

| Endpoint | |
| --- | --- |
| `GET /organizations/admin/all` | Every org, including unapproved ones |
| `PATCH /organizations/admin/:orgId/approval` | Body `{ approved: boolean }` |

Anything else gets `ForbiddenException("You must be a MAPS member to access
this")`. Note that **any** MAPS role passes — `MEMBER`, `ADMIN` and `OWNER` are
all accepted — so the gate is "is in MAPS", not "runs MAPS". A plain MAPS member
can approve and un-approve every organization on the platform.

### One UUID, three copies, two repos

`c997beea-620f-4b83-bb97-12f3c0b96a14` is hardcoded in three places:

| Repo | File | Role |
| --- | --- | --- |
| frontend | `constants/organizations.ts` | `MAPS_ORG_ID` — hides the menu entry and the page |
| backend | `src/organizations/organizations.service.ts` | `MAPS_ORG_ID` — the real gate |
| backend | `prisma/dev-seed.ts` | Seeds the MAPS org with exactly that ID, so local dev works at all |

Nothing verifies they agree — not a build step, not a test. If they drift the
failure is silent and asymmetric: change only the frontend and the menu entry
vanishes for actual admins; change only the backend and the page still renders,
lists nothing, and every toggle 403s with no visible reason.

### Testing it locally

`npm run seed:dev-db` in the backend sets up everything needed:

- **`Kristian@gmail.com`** — the same user as in the dev-login example above — is
  seeded as a MAPS `MEMBER`, so the default local login already sees the admin
  panel. You do not need a special account.
- **`Svein@gmail.com`** is MAPS `ADMIN`, if you want to check that role makes no
  difference (it does not).
- Exactly one seeded organization, **`Navet`**, is created with
  `approved: false`, so there is always something to toggle.

The list uses `fetchAllFromPeoplyApiJson` rather than a plain fetch, so it pages
through every organization instead of stopping at the first 100 — see
[How data fetching works](#how-data-fetching-works).

## Scripts

| | |
| --- | --- |
| `npm run dev` | Dev server on 3001 |
| `npm run build` / `npm start` | Production build and serve |
| `npm test` / `npm run test:watch` | Vitest |
| `npm run lint` | Biome (JS/TS) + Stylelint (SCSS) |
| `npm run format` | Applies Biome's fixes |
| `npm run typecheck` | Type check (app, then the service worker separately — it needs `webworker` types instead of `dom`) |

Those four checks — type check, lint, test, build — are exactly what CI runs, and
a red job blocks both merge and deploy. Run them before pushing.

## More

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branching, commit format, CI, deploys
- [`HALL_OF_FAME.md`](HALL_OF_FAME.md) — everyone who built this before the move
  to the `MAPSuio` organization
