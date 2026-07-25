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
    // that next-themes sets. It is imported once from globals.scss instead.
    additionalData: `@import "variables"; @import "mixins";`,
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
