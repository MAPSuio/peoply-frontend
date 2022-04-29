// const withPWA = require('next-pwa');

module.exports = /* withPWA( */{
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
    // formats: ["webp", "png", "jpg", "jpeg", "gif"],
  },

  // generate manifest using https://www.simicart.com/
  // pwa: {
    // dest: 'public',
    // disable: process.env.NODE_ENV === 'development',
    // disable: true,
    // register: true,
  // }
}/* ) */;
