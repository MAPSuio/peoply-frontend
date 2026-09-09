import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { readStoredDraft } from "../hooks/createEvent/eventDraft";
import useCreateEventForm from "../hooks/useCreateEventForm";
import { ImageCaching } from "../types/types";

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

  it("keeps an explicit validity patch, rather than the step state overwriting it", async () => {
    await act(async () => {
      await form.updateEventImage({
        target: {
          files: [new File(["x"], "plakat.png", { type: "image/png" })],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(storedDraft().eventImageValid).toBe(true);
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

function pickedFile(file: File) {
  return {
    target: { files: [file] },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("the cached create-event image", () => {
  beforeEach(() => {
    localStorage.clear();
    render(<Consumer />);
  });

  it("says the image is not cached when the file cannot be read", async () => {
    const failingReader = vi
      .spyOn(FileReader.prototype, "readAsDataURL")
      .mockImplementation(function (this: FileReader) {
        this.dispatchEvent(new Event("error"));
      });

    await act(async () => {
      await form.updateEventImage(
        pickedFile(new File(["x"], "poster.png", { type: "image/png" })),
      );
    });

    expect(localStorage.getItem("eventImage")).toBeNull();
    expect(form.eventObject.imageCached).toBe(ImageCaching.PREEMPTIVE_MESSAGE);

    failingReader.mockRestore();
  });

  it("keeps the last picked image when an earlier read finishes late", async () => {
    const pending: Array<() => void> = [];
    const slowReader = vi
      .spyOn(FileReader.prototype, "readAsDataURL")
      .mockImplementation(function (this: FileReader, file: Blob) {
        pending.push(() => {
          Object.defineProperty(this, "result", {
            value: `data:image/png;base64,${(file as File).name}`,
            configurable: true,
          });
          this.dispatchEvent(new Event("load"));
        });
      });

    const first = form.updateEventImage(
      pickedFile(new File(["a"], "first", { type: "image/png" })),
    );
    const second = form.updateEventImage(
      pickedFile(new File(["b"], "second", { type: "image/png" })),
    );

    await act(async () => {
      pending[1]();
      pending[0]();
      await Promise.all([first, second]);
    });

    expect(localStorage.getItem("eventImage")).toBe(
      "data:image/png;base64,second",
    );

    slowReader.mockRestore();
  });
});

describe("a draft localStorage cannot parse", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is thrown away rather than crashing the page", () => {
    localStorage.setItem("eventObject", "{not json");

    expect(readStoredDraft()).toBeNull();
    expect(localStorage.getItem("eventObject")).toBeNull();
  });
});

const DRAFT_STORAGE = join("hooks", "createEvent", "eventDraft.ts");

const STORES_A_DRAFT_KEY =
  /(?:local|session)Storage\.\w+\(\s*["'`]event(?:Object|Image)["'`]/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

describe("the create-event draft in storage", () => {
  it("is read and written from one module, whatever the quoting", () => {
    const projectRoot = join(__dirname, "..");
    const offenders = ["components", "pages", "hooks", "services", "utils"]
      .flatMap((directory) => sourceFiles(join(projectRoot, directory)))
      .filter((path) => STORES_A_DRAFT_KEY.test(readFileSync(path, "utf8")))
      .map((path) => relative(projectRoot, path))
      .filter((path) => path !== DRAFT_STORAGE);

    expect(offenders).toEqual([]);
  });
});
