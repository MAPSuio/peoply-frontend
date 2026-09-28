import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EmailLogin from "../pages/login/email";
import { getApiBaseUrl } from "../services/apiUrl";

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

let assigned: string;
const fetchMock = vi.fn();

beforeEach(() => {
  routerQuery = {};
  assigned = "";
  localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      assign: (value: string) => {
        assigned = value;
      },
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const lastRequest = () => {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return { url, init, body: JSON.parse(init.body as string) };
};

describe("requesting a login link", () => {
  it("posts the email and shows the same answer whether or not the account exists", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 202 }));

    render(<EmailLogin />);
    await userEvent.type(screen.getByLabelText("E-post"), "ola@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send lenke" }));

    const { url, init, body } = lastRequest();
    expect(url).toBe(`${getApiBaseUrl()}/auth/email/request`);
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(body).toEqual({ email: "ola@example.com" });
    expect(await screen.findByText(/Sjekk e-posten din/)).toBeTruthy();
  });

  it("tells the user to wait when rate limited", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 429 }));

    render(<EmailLogin />);
    await userEvent.type(screen.getByLabelText("E-post"), "ola@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send lenke" }));

    expect(await screen.findByText(/For mange forsøk/)).toBeTruthy();
  });

  it("drops the answer to a request for an email the user has since changed", async () => {
    let answer: ((response: Response) => void) | undefined;
    fetchMock.mockReturnValue(
      new Promise<Response>((resolve) => {
        answer = resolve;
      }),
    );

    render(<EmailLogin />);
    const input = screen.getByLabelText("E-post");
    await userEvent.type(input, "ola@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send lenke" }));
    await userEvent.type(input, "x");
    answer?.(new Response("{}", { status: 202 }));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByText(/Sjekk e-posten din/)).toBeNull();
  });
});

describe("opening the link from the email", () => {
  it("does not use the link until the user presses the button", () => {
    routerQuery = { token: "abc" };

    render(<EmailLogin />);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Logg inn" })).toBeTruthy();
  });

  it("logs in and goes to the stashed page on success", async () => {
    routerQuery = { token: "abc" };
    localStorage.setItem("redirectURL", "/events/42");
    fetchMock.mockResolvedValue(new Response("{}", { status: 201 }));

    render(<EmailLogin />);
    await userEvent.click(screen.getByRole("button", { name: "Logg inn" }));

    const { url, init, body } = lastRequest();
    expect(url).toBe(`${getApiBaseUrl()}/auth/email/verify`);
    expect(init.credentials).toBe("include");
    expect(body).toEqual({ token: "abc" });
    await vi.waitFor(() => expect(assigned).toBe("/events/42"));
    expect(localStorage.getItem("redirectURL")).toBeNull();
  });

  it("never follows an off-site redirect after login", async () => {
    routerQuery = { token: "abc" };
    localStorage.setItem("redirectURL", "https://evil.example");
    fetchMock.mockResolvedValue(new Response("{}", { status: 201 }));

    render(<EmailLogin />);
    await userEvent.click(screen.getByRole("button", { name: "Logg inn" }));

    await vi.waitFor(() => expect(assigned).toBe("/"));
  });

  it("explains an expired or used link and offers a new one", async () => {
    routerQuery = { token: "abc" };
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));

    render(<EmailLogin />);
    await userEvent.click(screen.getByRole("button", { name: "Logg inn" }));

    expect(await screen.findByText(/utløpt eller allerede brukt/)).toBeTruthy();
    expect(assigned).toBe("");
    expect(
      screen
        .getByRole("link", { name: "Be om en ny lenke" })
        .getAttribute("href"),
    ).toBe("/login/email");
  });
});
