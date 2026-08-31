import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = join(__dirname, "..");
const PAGES = join(PROJECT_ROOT, "pages");

/**
 * An error message followed straight away by a navigation is a guard sending
 * the visitor off a page they may not see. `push` leaves that page in the
 * history behind its own destination, so back lands on it, it redirects
 * forward again and the visitor is trapped. useRedirectWithReason exists so
 * no page has to remember this.
 */
const ERROR_SNACK_THEN_PUSH =
  /addSnack\([^;]*SnackTypes\.ERROR[^;]*\);\s*router\.push\(/s;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("guard redirects", () => {
  it("send the visitor away with replace, through useRedirectWithReason", () => {
    const offenders = sourceFiles(PAGES)
      .filter((path) => ERROR_SNACK_THEN_PUSH.test(readFileSync(path, "utf8")))
      .map((path) => relative(PROJECT_ROOT, path));

    expect(offenders).toEqual([]);
  });

  it("finds pages to check at all", () => {
    expect(sourceFiles(PAGES).length).toBeGreaterThan(10);
  });
});
