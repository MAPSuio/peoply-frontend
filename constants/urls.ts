/**
 * The app's own public origin, e.g. `https://peoply.app` — used to build the
 * absolute URLs that only make sense absolute: `og:url`, share links, ICS feeds.
 *
 * Read once here rather than per page. `NEXT_PUBLIC_*` is substituted textually
 * by Next at build time, so this is the same string in the server and client
 * bundles and costs nothing at runtime — which is why the ten `getStaticProps`
 * that used to hand this value down as a prop were doing no work.
 *
 * Empty string when unset. Callers that build a canonical URL should treat that
 * as "no canonical URL" and emit nothing, not a path with a leading slash that
 * resolves against whatever origin the crawler happens to be on. `HeadComponent`
 * already does.
 */
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

/**
 * The Peoply API's *public* origin - the one safe to put in front of a user, in
 * an `href` or as documentation.
 *
 * Not interchangeable with `getApiBaseUrl()` in `services/apiUrl.ts`, which
 * resolves the origin this app should *fetch* from and deliberately returns
 * `API_INTERNAL_URL` on the server to bypass Cloudflare. Rendering that into an
 * anchor would ship an internal hostname to the browser, so links and docs use
 * this instead, and only `fetchers`/`auth` use that.
 *
 * The integrations page had the production host hardcoded rather than either.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
