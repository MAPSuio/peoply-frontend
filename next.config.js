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
    deviceSizes: [480, 640, 750, 828, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
})(nextConfig);
