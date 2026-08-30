import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FAQ from "../pages/faq";
import Integrasjoner from "../pages/integrasjoner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProfileMenu from "../components/ProfileMenu";

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

const hrefOf = (name: RegExp) =>
  screen.getByRole("link", { name }).getAttribute("href");

describe("API and feedback entry points", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({ user: undefined, loading: false });
    mockListKeys.mockResolvedValue([]);
    mockCreateKey.mockReset();
    mockRevokeKey.mockReset();
  });

  it("offers the API docs from the front-page footer", () => {
    render(<Footer />);

    expect(hrefOf(/API for utviklere/i)).toBe("/integrasjoner");
  });

  it("offers the API docs from the profile menu", () => {
    render(<ProfileMenu />);

    expect(hrefOf(/^API$/)).toBe("/integrasjoner");
  });

  it("gives coding agents copyable, contract-first prompts", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("clipboard unavailable"));
    render(<Integrasjoner />);

    expect(
      screen.getByRole("heading", { name: /Bygg med Peoply API-et/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Kopier prompt/i }),
    ).toHaveLength(4);
    expect(hrefOf(/llms\.txt/i)).toBe("/llms.txt");
    expect(
      screen.getByRole("heading", {
        name: /Koble assistenten din til Peoply/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("https://api.peoply.app/mcp")).toBeInTheDocument();
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
      scopes: ["READ"],
      expiresAt: "2026-12-01T00:00:00.000Z",
      createdAt: "2026-09-01T00:00:00.000Z",
      token: "ppl_mcp_secret",
    };
    mockUseUser.mockReturnValue({ user: { id: "user-1" }, loading: false });
    mockCreateKey.mockResolvedValue(key);
    mockRevokeKey.mockResolvedValue(undefined);
    render(<Integrasjoner />);

    await user.type(screen.getByLabelText("Navn på nøkkelen"), "Claude Code");
    await user.click(screen.getByRole("button", { name: "Opprett nøkkel" }));

    expect(await screen.findByText("ppl_mcp_secret")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Tilbakekall" }));
    expect(mockRevokeKey).toHaveBeenCalledWith(key.id);
    expect(await screen.findByText("Tilbakekalt")).toBeInTheDocument();
  });

  it("sends feedback from the FAQ contact section", () => {
    render(<FAQ />);

    expect(hrefOf(/^Feedback$/)).toBe("/feedback");
  });

  it("no longer crowds the header with those links", () => {
    render(<Header />);

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
