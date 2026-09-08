import { readFileSync } from "node:fs";
import { join } from "node:path";

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

describe("the draft writer", () => {
  const source = readFileSync(
    join(__dirname, "..", "hooks", "useCreateEventForm.ts"),
    "utf8",
  );

  it("is reached through patchEvent alone", () => {
    const calls = source.match(/(?<!function )updateLocalStorage\(/g) ?? [];

    expect(calls).toHaveLength(1);
  });
});
