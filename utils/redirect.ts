/**
 * The default destination when a redirect cannot be trusted.
 */
const FALLBACK_REDIRECT = "/";

/**
 * Reduces a post-login redirect to a path on this site, or gives up and
 * returns "/".
 *
 * `?redirect=` is copied into localStorage before the OAuth hop and handed to
 * `router.push` when the user lands back on /login/callback. Next's router
 * treats anything with a scheme as non-local and falls back to a hard
 * navigation:
 *
 *   // shared/lib/router/router.js
 *   if (!isLocalURL(url)) { handleHardNavigation({ url, router }); return false }
 *   // handleHardNavigation:
 *   window.location.href = url
 *
 * and assigning a `javascript:` URL to `location.href` runs it in this origin.
 * `https://evil.example` in the same place is an open redirect out of
 * peoply.app, which is the more ordinary phishing primitive. React blocks a
 * `javascript:` href on an `<a>` itself, but the router never goes through
 * React.
 *
 * So: one leading slash, and nothing else.
 */
export function toSafeRedirectPath(
  value: unknown,
  fallback: string = FALLBACK_REDIRECT,
): string {
  if (typeof value !== "string" || value === "") return fallback;

  // A scheme ("javascript:", "https:", "data:") never starts with a slash, so
  // requiring one rules the whole class out.
  if (!value.startsWith("/")) return fallback;

  // "//evil.example" is protocol-relative — a different site, and one Next
  // considers local because it has no scheme. "/\evil.example" is the same
  // thing to browsers that fold backslashes into slashes.
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  // Control characters let "/\tjavascript:…" style payloads survive a naive
  // check elsewhere, and have no business in a path we generated.
  // biome-ignore lint/suspicious/noControlCharactersInRegex: that is the point.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  return value;
}
