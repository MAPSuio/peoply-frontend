import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    /* Next's build output and the PWA service worker are not test sources. */
    exclude: ["node_modules", ".next", "public"],
    css: false,
  },
});
