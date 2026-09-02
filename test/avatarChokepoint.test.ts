import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = join(__dirname, "..");
const SCANNED_DIRECTORIES = ["components", "pages", "utils", "hooks"];

const SUBJECT_IMAGE_FIELD = /(?<!classNames|styles)\.image\b/;

const ALLOWED = [
  "utils/avatar.ts",
  "utils/event.ts",
  "components/EditSummaryPage.tsx",
  "pages/orgs/[oid]/index.tsx",
  "pages/orgs/[oid]/members/index.tsx",
  "pages/users/[uid].tsx",
];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

function scannedFiles() {
  return SCANNED_DIRECTORIES.flatMap((directory) =>
    sourceFiles(join(PROJECT_ROOT, directory)),
  );
}

describe("avatar chokepoint", () => {
  it("resolves a subject's picture in utils/avatar.ts and nowhere else", () => {
    const offenders = scannedFiles()
      .filter((path) => SUBJECT_IMAGE_FIELD.test(readFileSync(path, "utf8")))
      .map((path) => relative(PROJECT_ROOT, path))
      .filter((path) => !ALLOWED.includes(path));

    expect(offenders).toEqual([]);
  });

  it("keeps the allowlist honest", () => {
    const scanned = scannedFiles().map((path) => relative(PROJECT_ROOT, path));

    expect(ALLOWED.filter((path) => !scanned.includes(path))).toEqual([]);
  });

  it("finds files to scan at all", () => {
    expect(scannedFiles().length).toBeGreaterThan(50);
  });
});
