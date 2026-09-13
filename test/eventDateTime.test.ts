import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

import { withDatePart, withTimePart } from "../utils/eventDateTime";

const PROJECT_ROOT = join(__dirname, "..");
const UI_DIRECTORIES = ["components", "pages", "hooks"];

const ISO_SURGERY =
  /\.(?:substring|slice)\(\s*(?:10\s*\)|0,\s*1[01]\s*\))|"T"\s*\+|:00\.000Z/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("swapping one half of an ISO timestamp", () => {
  const startOfEvening = "2026-10-01T18:00:00.000Z";

  it("keeps the time when the date changes", () => {
    expect(withDatePart(startOfEvening, "2026-11-02")).toBe(
      "2026-11-02T18:00:00.000Z",
    );
  });

  it("keeps the date when the time changes", () => {
    expect(withTimePart(startOfEvening, "07:30")).toBe(
      "2026-10-01T07:30:00.000Z",
    );
  });

  it("keeps seconds the stored timestamp already carries", () => {
    expect(withDatePart("2026-10-01T18:00:45.500Z", "2026-11-02")).toBe(
      "2026-11-02T18:00:45.500Z",
    );
  });

  it("still produces a parseable timestamp both ways", () => {
    const moved = withTimePart(
      withDatePart(startOfEvening, "2027-01-15"),
      "23:59",
    );

    expect(new Date(moved).toISOString()).toBe(moved);
  });
});

describe("the edit-summary date and time fields", () => {
  it("build timestamps through the shared helpers alone", () => {
    const offenders = UI_DIRECTORIES.flatMap((directory) =>
      sourceFiles(join(PROJECT_ROOT, directory)),
    )
      .filter((path) => ISO_SURGERY.test(readFileSync(path, "utf8")))
      .map((path) => relative(PROJECT_ROOT, path));

    expect(offenders).toEqual([]);
  });
});
