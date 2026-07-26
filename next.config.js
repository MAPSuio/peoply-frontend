/**
 * No PWA plugin here any more. The service worker is built by `serwist build`
 * as a separate step after `next build` (see serwist.config.mjs and the
 * `build` script). Removing the last webpack plugin from this config is what let
 * the build switch to Turbopack; adding one back would undo that.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["nb"],
    defaultLocale: "nb",
  },

  reactStrictMode: true,

  experimental: {
    // TypeScript 7 is the native Go port. It ships the `tsc` CLI but not the
    // JS compiler API (`createProgram` and friends) that `next build` reaches
    // for to run its own type check, so without this the build dies at
    // "Running TypeScript ..." with a clear message and exit code 1.
    //
    // This makes Next shell out to the CLI instead - the same binary
    // `npm run typecheck` already uses, so the two now agree by construction
    // rather than by coincidence. Drop the flag once Next reads TS 7 natively.
    useTypeScriptCli: true,
  },

  sassOptions: {
    // Only value-producing partials belong here. `_themes.scss` emits actual
    // rule blocks (html.dark/.night/.light), so injecting it into every
    // *.module.scss made CSS Modules hash the class part of those selectors
    // (html.Button_dark__x1y2z), which can never match the plain `dark` class
    // that next-themes sets. It is loaded once from globals.scss instead.
    //
    // `as *` keeps every member unprefixed, so `$primary-color-400` and
    // `@include respond-to(...)` read the same as they did under `@import`.
    // Both partials are listed even though `_mixins.scss` uses variables
    // itself: `@use` does not re-export what it loads, so a module that only
    // loaded mixins would not see a single variable.
    additionalData: `@use "variables" as *; @use "mixins" as *;`,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.BLOB_DOMAIN || '',
      },
    ],
    deviceSizes: [480, 750, 1080, 1920],
    imageSizes: [16, 48, 96, 256],
    minimumCacheTTL: 3600,
  },
};

module.exports = nextConfig;
