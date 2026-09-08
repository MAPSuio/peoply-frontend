import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { RegStatus, SnackTypes } from "../types/types";
import { announceRegistration } from "../utils/registrationOutcome";

const PROJECT_ROOT = join(__dirname, "..");
const UI_DIRECTORIES = ["components", "pages", "hooks"];

const REGISTRATION_SNACK_TEXT = /"Du er nå (?:meldt|på venteliste)/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

function announcer() {
  return { refresh: vi.fn(), snack: vi.fn() };
}

describe("telling the visitor what their registration became", () => {
  it("names the status they ended up in", () => {
    const listeners = announcer();

    announceRegistration(
      { regStatus: RegStatus.WAITLISTED },
      "Det gikk galt",
      listeners,
    );

    expect(listeners.snack).toHaveBeenCalledWith(
      "Du er nå på venteliste",
      SnackTypes.SUCCESS,
    );
  });

  it("refreshes what is on screen when the registration went through", () => {
    const listeners = announcer();

    announceRegistration(
      { regStatus: RegStatus.GOING },
      "Det gikk galt",
      listeners,
    );

    expect(listeners.refresh).toHaveBeenCalledTimes(1);
  });

  it("says what failed when nothing came back", () => {
    const listeners = announcer();

    announceRegistration(undefined, "Det gikk galt", listeners);

    expect(listeners.snack).toHaveBeenCalledWith(
      "Det gikk galt",
      SnackTypes.ERROR,
    );
    expect(listeners.refresh).not.toHaveBeenCalled();
  });

  it("still refreshes a status it has no wording for", () => {
    const listeners = announcer();

    announceRegistration(
      { regStatus: RegStatus.INVITED },
      "Det gikk galt",
      listeners,
    );

    expect(listeners.refresh).toHaveBeenCalledTimes(1);
    expect(listeners.snack).not.toHaveBeenCalled();
  });
});

describe("registration wording", () => {
  it("lives in one module, not at every call site", () => {
    const offenders = UI_DIRECTORIES.flatMap((directory) =>
      sourceFiles(join(PROJECT_ROOT, directory)),
    )
      .filter((path) =>
        REGISTRATION_SNACK_TEXT.test(readFileSync(path, "utf8")),
      )
      .map((path) => relative(PROJECT_ROOT, path));

    expect(offenders).toEqual([]);
  });
});
