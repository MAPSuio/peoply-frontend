/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  sassOptions: {
    prependData: `@import "variables"; @import "mixins";`,
}
}
