const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

module.exports = (phase) => {
  /** @type {import('next').NextConfig} */

  const nextConfig = {
    reactStrictMode: true,
    sassOptions: {
      prependData: `@import "variables"; @import "mixins";`,
  },
    env: {
      API_URL: phase === PHASE_DEVELOPMENT_SERVER ? "http://localhost:3000" : "https://peoply.azurewebsites.net"
    }
  }

  return nextConfig;

}
