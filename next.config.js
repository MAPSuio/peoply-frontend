const withPWA = require('@ducanh2912/next-pwa').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["nb"],
    defaultLocale: "nb",
  },

  reactStrictMode: true,
  sassOptions: {
    prependData: `@import "variables"; @import "mixins"; @import "themes";`,
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
