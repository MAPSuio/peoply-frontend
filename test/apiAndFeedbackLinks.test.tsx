import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FAQ from "../pages/faq";
import Integrasjoner from "../pages/integrasjoner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProfileMenu from "../components/ProfileMenu";
import { API_URL } from "../constants/urls";

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: {},
    push: vi.fn(),
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));

const { mockCreateKey, mockListKeys, mockRevokeKey, mockUseUser } = vi.hoisted(
  () => ({
    mockCreateKey: vi.fn(),
    mockListKeys: vi.fn(),
    mockRevokeKey: vi.fn(),
    mockUseUser: vi.fn(),
  }),
);

vi.mock("../hooks/useUser", () => ({ default: mockUseUser }));
vi.mock("../services/mcpKeys", () => ({
  createMcpApiKey: mockCreateKey,
  listMcpApiKeys: mockListKeys,
  revokeMcpApiKey: mockRevokeKey,
}));
vi.mock("../hooks/useNotifications", () => ({
  default: () => ({ hasUnreadNotifications: false }),
}));
vi.mock("../hooks/useBack", () => ({ default: () => vi.fn() }));
vi.mock("../components/HeadComponent", () => ({ default: () => null }));

const renderWithSwr = (ui: React.ReactElement) =>
  render(<SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>);

const hrefOf = (name: RegExp) =>
  screen.getByRole("link", { name }).getAttribute("href");

describe("API and feedback entry points", () => {
  const expectedMcpUrl = `${(API_URL || "https://api.peoply.app").replace(/\/+$/, "")}/mcp`;

  beforeEach(() => {
    mockUseUser.mockReturnValue({ user: undefined, loading: false });
    mockListKeys.mockResolvedValue([]);
    mockCreateKey.mockReset();
    mockRevokeKey.mockReset();
  });

  it("offers the API docs from the front-page footer", () => {
    renderWithSwr(<Footer />);

    expect(hrefOf(/API for utviklere/i)).toBe("/integrasjoner");
  });

  it("offers the API docs from the profile menu", () => {
    renderWithSwr(<ProfileMenu />);

    expect(hrefOf(/^API$/)).toBe("/integrasjoner");
  });

  it("gives coding agents copyable, contract-first prompts", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("clipboard unavailable"));
    renderWithSwr(<Integrasjoner />);

    expect(
      screen.getByRole("heading", { name: /Bygg med Peoply API-et/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Kopier prompt/i }),
    ).toHaveLength(4);
    expect(hrefOf(/llms\.txt/i)).toBe("/llms.txt");
    expect(
      screen.getByRole("heading", {
        name: /Model Context Protocol/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(expectedMcpUrl)).toBeInTheDocument();
    expect(hrefOf(/Logg inn/i)).toBe("/login");
    expect(screen.getAllByText(/openapi\.json/i)).not.toHaveLength(0);

    const eventPrompt = screen.getByRole("button", {
      name: /Kopier prompt: Bygg en arrangement-feed/i,
    });
    const organizationPrompt = screen.getByRole("button", {
      name: /Kopier prompt: Legg til foreningssøk/i,
    });
    await user.click(eventPrompt);
    expect(
      await screen.findByRole("button", { name: /Prompt kopiert/i }),
    ).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("GET https://api.peoply.app/events"),
    );

    await user.click(organizationPrompt);
    expect(
      await screen.findByRole("button", { name: /Kunne ikke kopiere/i }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("status")).toHaveTextContent("Prøv igjen");
  });

  it("creates and revokes a personal MCP key", async () => {
    const user = userEvent.setup();
    const key = {
      id: "775e3f3c-f489-4bce-a9fb-a76173237d44",
      name: "Claude Code",
      scopes: ["READ", "WRITE"],
      expiresAt: "2026-12-01T00:00:00.000Z",
      createdAt: "2026-09-01T00:00:00.000Z",
      token: "ppl_mcp_secret",
    };
    mockUseUser.mockReturnValue({ user: { id: "user-1" }, loading: false });
    mockCreateKey.mockResolvedValue(key);
    mockRevokeKey.mockResolvedValue(undefined);
    renderWithSwr(<Integrasjoner />);

    await user.type(
      screen.getByLabelText("Navn på nøkkelen"),
      "  Claude Code  ",
    );
    await user.click(screen.getByRole("checkbox", { name: /Skriv/i }));
    await user.click(screen.getByRole("button", { name: "Opprett nøkkel" }));

    expect(mockCreateKey).toHaveBeenCalledWith("Claude Code", [
      "READ",
      "WRITE",
    ]);
    expect(await screen.findByText("ppl_mcp_secret")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tilbakekall" }));
    expect(mockRevokeKey).toHaveBeenCalledWith(key.id);
    expect(await screen.findByText("Tilbakekalt")).toBeInTheDocument();
  });

  it("displays an error message when key creation fails", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({ user: { id: "user-1" }, loading: false });
    mockCreateKey.mockRejectedValue(new Error("API failure"));
    renderWithSwr(<Integrasjoner />);

    await user.type(screen.getByLabelText("Navn på nøkkelen"), "Feiler");
    await user.click(screen.getByRole("button", { name: "Opprett nøkkel" }));

    expect(
      await screen.findByText("Kunne ikke opprette API-nøkkelen."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Kopier nøkkelen nå/i)).not.toBeInTheDocument();
  });

  it("sends feedback from the FAQ contact section", () => {
    renderWithSwr(<FAQ />);

    expect(hrefOf(/^Feedback$/)).toBe("/feedback");
  });

  it("no longer crowds the header with those links", () => {
    renderWithSwr(<Header />);

    expect(
      screen.queryByRole("link", { name: /API/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /FAQ/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Feedback/i }),
    ).not.toBeInTheDocument();
  });
});
