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
})(nextConfig);
