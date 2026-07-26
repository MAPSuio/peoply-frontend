/**
 * `next-pwa` is a webpack plugin: `withPWA` works by injecting a `webpack`
 * config that runs workbox and emits public/sw.js. Turbopack does not run
 * webpack plugins, so the `--webpack` flag in the `dev` and `build` scripts is
 * load-bearing, not a leftover from the Next 16 upgrade.
 *
 * Removing it does not fail the build. `next build --turbopack` exits 0 and
 * prerenders every route - it just silently emits no sw.js, no workbox-*.js
 * and no fallback-*.js, so the deployed app quietly loses offline support and
 * installability. Dropping the flag without `--turbopack` is at least loud:
 * Next errors on "a `webpack` config and no `turbopack` config".
 *
 * Moving to Turbopack means replacing this plugin first - Serwist is the
 * maintained successor by the same author - not deleting the flag.
 */
const withPWA = require('@ducanh2912/next-pwa').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["nb"],
    defaultLocale: "nb",
  },

  reactStrictMode: true,
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

module.exports = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    // Setting `exclude` replaces next-pwa's default list rather than extending
    // it, so the three defaults are repeated here verbatim.
    exclude: [
      /\/_next\/static\/.*(?<!\.p)\.woff2/,
      /\.map$/,
      /^manifest.*\.js$/,
      // Next 16 writes .next/dynamic-css-manifest.json but never serves it at
      // /_next/dynamic-css-manifest.json, so precaching it always 404s.
      // Workbox treats precaching as all-or-nothing: that single 404 aborts
      // the whole install, and the service worker never activates.
      /dynamic-css-manifest\.json$/,
    ],
  },
})(nextConfig);
