import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginCallback from "../pages/login/callback";
import { API_URL } from "../constants/urls";
import { LoginProvider } from "../types/types";

let routerQuery: Record<string, string> = {};
const router = {
  get query() {
    return routerQuery;
  },
  push: vi.fn(),
  replace: vi.fn(),
  isReady: true,
};

vi.mock("next/router", () => ({ useRouter: () => router }));

let navigatedTo: string;

beforeEach(() => {
  navigatedTo = "";
  routerQuery = {};
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      get href() {
        return navigatedTo;
      },
      set href(value: string) {
        navigatedTo = value;
      },
    },
  });
});

const clickConfirmButtonFor = async (
  promptedProvider: LoginProvider,
  existingProvider: LoginProvider,
  buttonLabel: string,
) => {
  routerQuery = { link_prompt: promptedProvider, link_with: existingProvider };

  render(<LoginCallback />);

  await userEvent.click(screen.getByRole("button", { name: buttonLabel }));
};

describe("confirming a parked account link from the modal", () => {
  it("sends a Vipps confirmation to the Vipps confirm-link entry point", async () => {
    await clickConfirmButtonFor(
      LoginProvider.GOOGLE,
      LoginProvider.VIPPS,
      "Logg inn med Vipps",
    );

    expect(navigatedTo).toBe(`${API_URL}/auth/confirm-link`);
  });

  it("sends a Google confirmation to the Google confirm-link entry point", async () => {
    await clickConfirmButtonFor(
      LoginProvider.VIPPS,
      LoginProvider.GOOGLE,
      "Logg inn med Google",
    );

    expect(navigatedTo).toBe(`${API_URL}/auth/confirm-link/google`);
  });

  it("never confirms through the plain login the backend wipes the link on", async () => {
    await clickConfirmButtonFor(
      LoginProvider.GOOGLE,
      LoginProvider.VIPPS,
      "Logg inn med Vipps",
    );

    expect(navigatedTo).not.toBe(`${API_URL}/auth/login`);
  });
});
