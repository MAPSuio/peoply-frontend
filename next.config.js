module.exports = () => {
  /** @type {import('next').NextConfig} */

  const nextConfig = {
    reactStrictMode: true,
    sassOptions: {
      prependData: `@import "variables"; @import "mixins";`,
    },
  }

  return nextConfig;
}
