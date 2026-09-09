import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useCreateEventForm from "../hooks/useCreateEventForm";

vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), asPath: "/" }),
}));
vi.mock("../hooks/useUser", () => ({
  default: () => ({
    user: { id: "u1", arrangerId: "a1" },
    loading: false,
    orgs: [],
  }),
}));
vi.mock("../hooks/useSnack", () => ({
  default: () => ({ addSnack: vi.fn() }),
}));
vi.mock("../hooks/useRedirectToLogin", () => ({ default: () => vi.fn() }));
vi.mock("swr", () => ({ default: () => ({ data: undefined }) }));

type Form = ReturnType<typeof useCreateEventForm>;

let form: Form;

function Consumer() {
  form = useCreateEventForm();
  return null;
}

function storedDraft() {
  return JSON.parse(localStorage.getItem("eventObject") ?? "{}");
}

function typedInto<Element extends HTMLInputElement | HTMLTextAreaElement>(
  value: string,
) {
  return { target: { value } } as React.ChangeEvent<Element>;
}

describe("the create-event draft in localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    render(<Consumer />);
  });

  it("keeps a field the visitor typed", () => {
    act(() => form.updateEventTitle(typedInto("Kodekveld")));

    expect(storedDraft().eventTitle).toBe("Kodekveld");
  });

  it("keeps both fields when two land before the next render", () => {
    act(() => {
      form.updateEventTitle(typedInto("Kodekveld"));
      form.updateEventLocationName(typedInto("Ole-Johan Dahls hus"));
    });

    expect(storedDraft().eventTitle).toBe("Kodekveld");
    expect(storedDraft().eventLocationName).toBe("Ole-Johan Dahls hus");
  });

  it("keeps the earlier fields when a third one follows a rerender", () => {
    act(() => form.updateEventTitle(typedInto("Kodekveld")));
    act(() => {
      form.updateEventLocationName(typedInto("Ole-Johan Dahls hus"));
      form.updateEventDescription(
        typedInto<HTMLTextAreaElement>("Ta med maskin"),
      );
    });

    expect(storedDraft().eventTitle).toBe("Kodekveld");
    expect(storedDraft().eventLocationName).toBe("Ole-Johan Dahls hus");
    expect(storedDraft().eventDescription).toBe("Ta med maskin");
  });
});

const DRAFT_STORAGE = join("hooks", "createEvent", "eventDraft.ts");

const DRAFT_STORAGE_KEY = /localStorage\.\w+\(\s*"event(?:Object|Image)"/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("the create-event draft in storage", () => {
  it("is read and written from one module", () => {
    const projectRoot = join(__dirname, "..");
    const offenders = ["components", "pages", "hooks"]
      .flatMap((directory) => sourceFiles(join(projectRoot, directory)))
      .filter((path) => DRAFT_STORAGE_KEY.test(readFileSync(path, "utf8")))
      .map((path) => relative(projectRoot, path))
      .filter((path) => path !== DRAFT_STORAGE);

    expect(offenders).toEqual([]);
  });
});
