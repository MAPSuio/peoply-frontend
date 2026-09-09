import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = join(__dirname, "..");
const SCANNED = ["components", "hooks", "pages", "services", "utils"];
const OWNS_THE_LOCALE = join("utils", "locale.ts");

const NORWEGIAN_LOCALE_LITERAL = /["'](?:nb|no)(?:-NO)?["']/g;

const FORMATS_WITH_A_LOCALE =
  /(?:toLocaleString|toLocaleDateString|toLocaleTimeString|localeCompare|Intl\.\w+)\s*\([^)]*["'](?:nb|no)(?:-NO)?["']/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("display locale", () => {
  it("is spelled in one module, so no call site can invent a fifth spelling", () => {
    const spellsItItself = SCANNED.flatMap((directory) =>
      sourceFiles(join(PROJECT_ROOT, directory)),
    )
      .filter((path) => FORMATS_WITH_A_LOCALE.test(readFileSync(path, "utf8")))
      .map((path) => relative(PROJECT_ROOT, path))
      .filter((path) => path !== OWNS_THE_LOCALE);

    expect(spellsItItself).toEqual([]);
  });

  it("is the only Norwegian locale string that module declares", () => {
    const source = readFileSync(join(PROJECT_ROOT, OWNS_THE_LOCALE), "utf8");

    expect(source.match(NORWEGIAN_LOCALE_LITERAL)).toEqual(['"nb-NO"']);
  });
});
