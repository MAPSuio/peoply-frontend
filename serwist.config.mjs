import { generateGlobPatterns, serwist } from "@serwist/next/config";

/**
 * Serwist in "configurator mode": `serwist build` bundles service-worker/index.ts
 * with esbuild and injects a precache manifest, as a separate step after
 * `next build`. This is the only Serwist setup that is not a webpack plugin, and
 * therefore the only one that survives the move to Turbopack. The obvious
 * drop-in, `withSerwistInit`, is a webpack plugin like next-pwa was and would
 * have kept us pinned to `--webpack`.
 *
 * `serwist()` resolves next.config.js itself to read `distDir` and `basePath`,
 * and derives the manifest transforms that map build-output paths to the URLs
 * they are actually served at (.next/static/x -> /_next/static/x, public/x -> /x).
 */
export default await serwist.withNextConfig((nextConfig) => {
  const distDir = `${nextConfig.distDir.replace(/^\/+|\/+$/g, "")}/`;
  const pagesDir = `${distDir}server/pages/`;

  /* Next writes prerendered pages under a locale directory when i18n is on, so
     the offline page is at .next/server/pages/nb/_offline.html. Serwist's own
     transform is i18n-unaware and would derive the URL /nb/_offline from that,
     but the default locale is served unprefixed, so the real URL is /_offline -
     and precaching a URL that 404s aborts the entire service worker install.
     Stripping the segment here (transforms passed in run before Serwist's) lets
     its transform produce the right URL. */
  const defaultLocalePrefix = nextConfig.i18n
    ? `${pagesDir}${nextConfig.i18n.defaultLocale}/`
    : null;

  return {
    swSrc: "service-worker/index.ts",
    swDest: "public/sw.js",

    /* Default is `true`, which precaches every prerendered route. next-pwa
       precached exactly one, /_offline, so this migration keeps that and globs
       the single HTML file instead. Turning it on is not just a flag flip: the
       built-in globIgnores for 404/500 are written without the locale segment,
       so they would miss nb/404.html and nb/500.html and precache both. */
    precachePrerendered: false,
    globPatterns: [
      ...generateGlobPatterns(distDir),
      `${defaultLocalePrefix ?? pagesDir}_offline.html`,
    ],
    manifestTransforms: [
      (entries) => ({
        manifest: entries.map((entry) => {
          let url = entry.url;

          if (defaultLocalePrefix && url.startsWith(defaultLocalePrefix)) {
            url = `${pagesDir}${url.slice(defaultLocalePrefix.length)}`;
          }

          /* Serwist globs the filesystem, so a dynamic route's chunk enters the
             manifest under its literal name, events/[eid]-<hash>.js. Next's
             router runs the asset path through encodeURI before fetching, so it
             requests events/%5Beid%5D-<hash>.js. Precache entries are keyed by
             URL, so leaving the brackets raw precaches 42 chunks under keys no
             request ever matches - they are downloaded, stored, and never read.
             encodeURI here is the same transform Next applies, so the key ends
             up identical to the request. */
          return { ...entry, url: encodeURI(url) };
        }),
        warnings: [],
      }),
    ],

    /* next-pwa's `exclude` list was regexes matched against webpack asset
       names; Serwist globs the build output on disk instead, so most of that
       list has no counterpart here:
       - `/\/_next\/static\/.*(?<!\.p)\.woff2/` and `/^manifest.*\.js$/` are
         moot: generateGlobPatterns only picks up a fixed extension list from
         .next/static, and woff2 is not in it.
       - `/dynamic-css-manifest\.json$/` is moot: Next writes that file to
         .next/, not .next/static/, so it is never globbed. It is the one entry
         that mattered - precaching it aborted the whole install with a 404.
       Only the source-map rule needs carrying over, because the glob over
       public/ is unfiltered. swDest and its map are ignored by serwist()
       already. */
    globIgnores: ["**/*.map"],
  };
});
