/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  sassOptions: {
    prependData: `@import "variables"; @import "mixins";`,
},
  env: {
    API_URL: "http://localhost:3000"
  }
}
