import { render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useOrganization = vi.fn();

vi.mock("../hooks/useOrganization", () => ({
  default: (...args: unknown[]) => useOrganization(...args),
}));
vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: { id: "u1" }, loading: false }),
}));
vi.mock("next/router", () => ({
  useRouter: () => ({ query: { oid: "maps" }, push: vi.fn() }),
}));
vi.mock("../hooks/useSnack", () => ({
  default: () => ({ addSnack: vi.fn() }),
}));
/* The not-found page loads a blurred static import, which the bundler
   normally turns into a blurDataURL. */
vi.mock("next/legacy/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

import OrganizationPage from "../pages/orgs/[oid]/index";
import type { Organization } from "../types/types";

const ORGANIZATION = {
  id: "org-1",
  urlId: "maps",
  name: "MAPS",
} as Organization;

const NOT_FOUND_TEXT = /Vi kunne ikke finne siden du leter etter/;

function renderPage(prerendered: Organization | null) {
  return render(
    <SWRConfig
      value={{ provider: () => new Map(), fetcher: async () => undefined }}
    >
      <OrganizationPage organization={prerendered} />
    </SWRConfig>,
  );
}

/**
 * The page is prerendered by a server that carries no cookie, so for an
 * organization only its members may see it is handed nothing and has to
 * resolve the page from the browser instead. These assert what a visitor ends
 * up looking at in each of the four ways that can go.
 */
describe("the organization page when the server prerendered nothing", () => {
  beforeEach(() => {
    useOrganization.mockReset();
  });

  it("does not claim the organization is gone while the browser is still asking", () => {
    useOrganization.mockReturnValue({ loading: true });

    renderPage(null);

    expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
  });

  it("renders the organization the browser resolved", () => {
    useOrganization.mockReturnValue({
      organization: ORGANIZATION,
      loading: false,
    });

    renderPage(null);

    expect(screen.getByText("MAPS")).toBeTruthy();
    expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
  });

  it("says not found once the browser confirms there is no such organization", () => {
    useOrganization.mockReturnValue({
      loading: false,
      organizationMissing: true,
      error: "Something went wrong when fetching organization data",
    });

    renderPage(null);

    expect(screen.getByText(NOT_FOUND_TEXT)).toBeTruthy();
  });

  /**
   * The failure that matters: a timeout or a 5xx leaves the page holding
   * nothing, exactly as a real absence does. Answering it with the not-found
   * page tells a founder their organization is gone because a request was
   * slow.
   */
  it("does not answer a failed lookup with the not-found page", () => {
    useOrganization.mockReturnValue({
      loading: false,
      organizationMissing: false,
      error: "Something went wrong when fetching organization data",
    });

    renderPage(null);

    expect(screen.queryByText(NOT_FOUND_TEXT)).toBeNull();
  });

  it("keeps rendering the prerendered organization when there is one", () => {
    useOrganization.mockReturnValue({ loading: true });

    renderPage(ORGANIZATION);

    expect(screen.getByText("MAPS")).toBeTruthy();
  });
});
