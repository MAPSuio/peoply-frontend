import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, type SerwistGlobalConfig, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    /* `serwist build` replaces this with the generated precache manifest. The
       list is computed from the build output on disk, so it only exists in the
       bundled public/sw.js - never in this source file. */
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  /* The same strategy list next-pwa applied by default: both are maintained by
     the same author, and `defaultCache` is its direct successor. Keeping it
     means the runtime cache names (pages, next-data, static-image-assets, ...)
     stay identical, so already-installed clients reuse their caches instead of
     refilling them on first load after the update. */
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        /* next-pwa inferred this from the presence of pages/_offline.tsx.
           Serwist requires it to be declared, and requires the URL to be in the
           precache manifest - serwist.config.mjs globs _offline.html for that
           reason. */
        url: "/_offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
