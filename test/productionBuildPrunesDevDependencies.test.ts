import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const packageJsonPath = path.resolve(__dirname, "..", "package.json");

describe("production build", () => {
  it("drops dev dependencies from the runtime image", () => {
    const { scripts } = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    expect(scripts["build:prod"]).toBe("npm run build && npm prune --omit=dev");
  });

  it("keeps everything next start loads at runtime in dependencies", () => {
    const { dependencies } = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf8"),
    );
    const nextConfigSource = fs.readFileSync(
      path.resolve(__dirname, "..", "next.config.js"),
      "utf8",
    );
    const packagesLoadedByNextStart = ["next", "react", "react-dom"];
    const requiredPackages = [
      ...packagesLoadedByNextStart,
      ...[
        ...nextConfigSource.matchAll(/require\(["']([^"'.][^"']*)["']\)/g),
      ].map(([, specifier]) => {
        const segments = specifier.split("/");
        return specifier.startsWith("@")
          ? segments.slice(0, 2).join("/")
          : segments[0];
      }),
    ];

    expect(requiredPackages.length).toBeGreaterThan(0);

    for (const packageName of requiredPackages) {
      expect(
        dependencies,
        `${packageName} must survive npm prune`,
      ).toHaveProperty([packageName]);
    }
  });
});
