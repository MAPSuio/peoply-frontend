import { defineConfig } from "vitest/config";

/* No React plugin. It existed only to transform JSX, which Vite's built-in
   esbuild already does for .tsx - it reads `jsx: "react-jsx"` straight from
   tsconfig.json. The plugin's own features are Fast Refresh and Babel-based
   transforms, neither of which means anything in a test run.
   Dropping it also drops the peer requirement on Vite 8 and the entire Babel
   tree underneath it. */
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    /* Next's build output and the PWA service worker are not test sources. */
    exclude: ["node_modules", ".next", "public"],
    css: false,
  },
});
