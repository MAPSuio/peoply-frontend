/**
 * Resolves the base URL for the Peoply API.
 *
 * Server-side requests prefer the internal URL so they bypass Cloudflare bot
 * protection; the browser always uses the public URL. Lives in its own module
 * so both `fetchers.ts` and `auth.ts` can share it without an import cycle
 * (`fetchers` already imports `refreshAccessToken` from `auth`).
 */
export function getApiBaseUrl() {
  return typeof window === "undefined" && process.env.API_INTERNAL_URL
    ? process.env.API_INTERNAL_URL
    : process.env.NEXT_PUBLIC_API_URL;
}
