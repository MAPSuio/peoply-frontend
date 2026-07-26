# Contributing

This is the frontend for [peoply.app](https://peoply.app), a Next.js app that
talks to the Peoply backend at `api.peoply.app`.

## Getting set up

The project requires **Node >= 20.9.0** and **npm >= 8** (`engines` in
`package.json`). Older Node versions will install but fail in ways that are
hard to read, so check `node -v` before opening an issue about a broken build.

```bash
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

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `ci:`, `build:`, optionally
scoped (`fix(pwa):`). Write the subject so it says what changed for a user or
a caller, not which file you touched.

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

### The pre-commit hook

`npm ci` installs a Husky `pre-commit` hook that lints the staged files — Biome
for JS/TS, Stylelint for SCSS. There is nothing to set up beyond the install.

It only reads. A failure prints what is wrong and aborts the commit; run
`npm run format` and stage the result. Nothing is rewritten underneath you, so
what you commit is what you staged.

It checks staged files only, so it is fast and it is not a substitute for
`npm run lint`. `git commit --no-verify` skips it when you need it to.

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

`.env.development` and `.env.production` are committed on purpose. They hold
only public values — the API base URL, the site URL and the blob domain, all of
which ship to the browser anyway via `NEXT_PUBLIC_*`.

Nothing secret belongs in this repository. Anything that must stay private
lives in the App Platform app or, for CI, in repository secrets.

## Prior art

`HALL_OF_FAME.md` credits everyone who built this before the move to the
`MAPSuio` organization.
