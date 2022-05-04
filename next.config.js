const withPWA = require('next-pwa');

module.exports = withPWA({
  /** @type {import('next').NextConfig} */

  i18n: {
    locales: ["nb"],
    defaultLocale: "nb",
    // localeDetector: {
    //   type: "cookie",
    //   options: {
    //     cookieKey: "i18n_redirected",
    //   },
    // },
    // redirect: true,
  },

  reactStrictMode: true,
  sassOptions: {
    prependData: `@import "variables"; @import "mixins";`,
  },

  images: {
    domains: [process.env.BLOB_DOMAIN],
    deviceSizes: [480, 640, 750, 828, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // formats: ["webp", "png", "jpg", "jpeg", "gif"],
  },

  // generate manifest using https://www.simicart.com/
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.peoply\.app\/users\/me/i,
        handler: 'NetworkFirst',
        method: 'GET',
          options: {
            cacheName: 'peoply-api-user-me',
            expiration: {
              maxEntries: 16,
              maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
            }
          }
      },
    ]
  }
});
