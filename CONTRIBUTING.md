# Contributing

This is the frontend for [peoply.app](https://peoply.app), a Next.js app that
talks to the Peoply backend at `api.peoply.app`.

## Getting set up

The project requires **Node >= 22.11.0** and **npm >= 10** (`engines` in
`package.json`). Older Node versions will install but fail in ways that are
hard to read, so check `node -v` before opening an issue about a broken build.

`.nvmrc` pins the exact version CI builds with — `nvm use` puts you on it, and
the CI workflow reads the same file, so there is one version to keep current.

```bash
nvm use       # reads .nvmrc
npm ci        # install exactly what the lockfile says
npm run dev   # http://localhost:3001
```

Use `npm ci` rather than `npm install`. `npm install` silently repairs a
lockfile that has drifted from `package.json`; CI uses `npm ci`, which fails
instead. A tree that only works under `npm install` is a tree that fails in CI.

To log in locally without Vipps or Google, run the backend with
`LOCAL_AUTH_ENABLED=true` and follow the mock auth flow described in
`README.md`.

## Making a change

Work on a branch and open a pull request. Nothing is pushed straight to
`master` — it deploys to production.

```bash
git checkout -b fix/thing-that-is-broken
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/),
enforced by a `commit-msg` hook — a message that does not parse is rejected
before the commit is created. Write the subject so it says what changed for a
user or a caller, not which file you touched.

```text
feat(header): link to source code from the front page
fix(pwa): stop the service worker precaching a 404
feat(api)!: drop the v1 endpoints
```

Types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`,
`revert`, `style`, `test`. The scope is optional; `!` before the colon marks a
breaking change.

The type must be lowercase. The subject need not be — `fix: API returns 500` is
fine, because a rule that rejects it would reject naming `API`, `SWR` or `Vipps`
first in the sentence. Merge, revert and fixup commits are ignored.

## Checks

Run these before pushing. They are the same four jobs CI runs, and a red job
blocks both merge and deploy.

```bash
npx tsc --noEmit   # Type Check
npm run lint       # Lint — Biome for JS/TS, Stylelint for SCSS
npm test           # Test — Vitest, specs in test/
npm run build      # Build
```

`npm run format` applies Biome's fixes. Biome owns formatting and linting for
JavaScript and TypeScript; Stylelint owns SCSS, including alphabetical property
order and uppercase hex colours.

New behaviour should come with a test in `test/`. The suite is small enough
that adding to it is cheap and skipping it is noticeable.

### The git hooks

`npm ci` installs two Husky hooks. There is nothing to set up beyond the install.

`commit-msg` checks the message against Conventional Commits (see above).

`pre-commit` lints the staged files — Biome for JS/TS, Stylelint for SCSS.

It only reads. A failure prints what is wrong and aborts the commit; run
`npm run format` and stage the result. Nothing is rewritten underneath you, so
what you commit is what you staged.

It checks staged files only, so it is fast and it is not a substitute for
`npm run lint`. `git commit --no-verify` skips it when you need it to.

## Data fetching

Three patterns coexist under `pages/`, on purpose — each answers a different
question about a page.

| Pattern | Used by | Why |
| --- | --- | --- |
| `getStaticProps` + `getStaticPaths` (ISR) | `orgs/[oid]`, `orgs/[oid]/events`, `users/[uid]` | Public, SEO-relevant pages with one canonical URL that doesn't depend on who's looking. `fallback: "blocking"` means no path is pre-rendered at build time — the first visitor renders it on the server and every later one gets the cached HTML, revalidated every 30 minutes (`revalidate: 60 * 30`). |
| `getServerSideProps` | `events/[eid]`, `sitemap.xml` | Needs the actual request. `events/[eid]` reads `context.req.headers.cookie` so the server can render registration/visibility state for the visitor who's asking, not a cached stranger. `sitemap.xml` writes straight to `res` and has to reflect current data on every crawl, not a 30-minute-old snapshot. |
| Client-side `useSWR`, no page-level data fetching | most other pages — `kalender`, `orgs` (the list), `events` (the list), everything under `me/*` | Either the content is user-specific/auth-gated (`me/*` needs a logged-in user before it can fetch anything, so there's nothing to pre-render) or it's genuinely dynamic (filters, search, "from today onward") where server-rendering the first page buys nothing. These also get the shared fetcher, retry policy and error toast from `SwrProvider` (see `components/SwrProvider.tsx`) for free. |

Picking one for a new page:

1. Public, cacheable, one URL per resource, same for every visitor →
   `getStaticProps` + `getStaticPaths` with `fallback: "blocking"`.
2. Needs something only the request has (cookies, headers) or must never
   serve a stale/cached response → `getServerSideProps`.
3. Otherwise (behind auth, user-specific, or a list/filter/search page) →
   client-side `useSWR`.

### QueryState

Client-side pages used to hand-roll their own `error && …` / `!data && …`
branches, so the same three states — loading, error, data — looked and
behaved slightly differently on every page. `components/QueryState.tsx` is
the shared version: it shows `LoadingWheel` while a request is in flight, a
Norwegian error message (with a retry button when the query's `mutate` is
passed through) once it fails, and calls its `children` render prop with the
data once it's ready.

```tsx
const eventsQuery = useSWR<Event[]>(url, fetcher);

<QueryState query={eventsQuery} errorMessage="Kunne ikke laste kalenderen.">
  {(events) => <EventCalendar events={events} />}
</QueryState>;
```

`query` accepts a `useSWR` result as-is, or a hand-built `{ data, error,
mutate }` object when a page composes more than one query into a single
gate. Use it for any page whose loading/error UI is just those three states;
don't force it onto a page with a genuinely different shape — a skeleton
card, several independent sections that fail separately, or a component that
already has its own bespoke empty state. `pages/kalender.tsx`,
`pages/orgs.tsx`, `pages/me/admin/orgs.tsx`, `pages/events/index.tsx` and
`pages/me/following.tsx` are the reference adoptions.

## Dependency updates

Dependabot opens PRs from `.github/dependabot.yml` — npm weekly, GitHub Actions
monthly. Minor and patch bumps arrive grouped into one PR so they can be
reviewed as a batch; majors come one at a time, because those are the ones worth
reading a changelog for.

They go through the same four checks as any other PR. React majors are ignored
on purpose: `react`, `react-dom` and both `@types` packages have to move
together, so that upgrade is done by hand.

## How deploys work

Merging to `master` runs the `deploy` job in `.github/workflows/ci.yml`, which
calls `digitalocean/app_action/deploy@v2` and deploys the `prod-peoply-frontend`
app on DigitalOcean App Platform. The job needs all four checks green first, so
a failing build cannot reach production.

The App Platform spec lives in DigitalOcean, not in this repository, and it
holds production environment variables. Do not commit a `.do/app.yaml` — it
would put those values in git history.

Deploys are gated on CI rather than on App Platform's own push hook
(`deploy_on_push` is off), so the workflow is the only path to production.

## Environment variables

Env files are not committed — copy `.env.example` to `.env.development` to get
started (see the README). The variables hold only public values — the API base
URL, the site URL and the blob domain, all of which ship to the browser anyway
via `NEXT_PUBLIC_*`. CI passes its own values explicitly in the build job, and
production values live in the App Platform spec.

Nothing secret belongs in this repository. Anything that must stay private
lives in the App Platform app or, for CI, in repository secrets.

## Prior art

`HALL_OF_FAME.md` credits everyone who built this before the move to the
`MAPSuio` organization.
