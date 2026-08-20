import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrganizationPage from "../pages/orgs/[oid]/index";
import type { Organization, UserOrganizationRoles } from "../types/types";
import { OrganizationRole } from "../types/types";

import useOrganization from "../hooks/useOrganization";

vi.mock("next/router", () => ({
  useRouter: () => ({ query: { oid: "my-org" }, push: vi.fn() }),
}));

vi.mock("../hooks/useOrganization", () => ({ default: vi.fn() }));
vi.mock("../hooks/useSnack", () => ({
  default: () => ({ addSnack: vi.fn() }),
}));

vi.mock("../components/HeadComponent", () => ({ default: () => null }));
vi.mock("../components/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("../components/organization/OrganizationHeading", () => ({
  default: () => <div data-testid="heading" />,
}));
vi.mock("../components/organization/OrganizationProfile", () => ({
  default: () => <div data-testid="profile" />,
}));
vi.mock("../components/organization/OrganizationStats", () => ({
  default: () => <div data-testid="stats" />,
}));
vi.mock("../components/organization/OrganizationUpcomingEvents", () => ({
  default: () => <div data-testid="upcoming" />,
}));
vi.mock("../components/organization/OrganizationAnalytics", () => ({
  default: () => <div data-testid="analytics" />,
}));

vi.mock("../services/fetchers", () => ({
  fetchFromPeoplyApiJson: vi.fn().mockResolvedValue([]),
}));

const useOrganizationMock = vi.mocked(useOrganization);

const organization = {
  id: "org-1",
  name: "MAPS",
  urlId: "my-org",
} as Organization;

const membership = {
  role: OrganizationRole.MEMBER,
  user: { id: "user-1" },
} as UserOrganizationRoles;

function renderPage(): ReturnType<typeof render> {
  const page = (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <OrganizationPage organization={organization} />
    </SWRConfig>
  ) as ReactElement;
  return render(page);
}

describe("organization page tabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the tabs for a plain MEMBER and switches to the analytics tab", async () => {
    useOrganizationMock.mockReturnValue({
      organization,
      organizationUsers: [membership],
      organizationUser: membership,
      isAdminOrOwner: false,
      isMember: true,
      loading: false,
    });

    renderPage();

    expect(screen.getByRole("button", { name: /oversikt/i })).toBeDefined();
    const statistikkTab = screen.getByRole("button", { name: /statistikk/i });
    expect(screen.getByTestId("upcoming")).toBeDefined();
    expect(screen.queryByTestId("analytics")).toBeNull();

    await userEvent.click(statistikkTab);

    expect(screen.getByTestId("analytics")).toBeDefined();
    // The org identity stays; only the overview content is swapped out.
    expect(screen.getByTestId("profile")).toBeDefined();
    expect(screen.queryByTestId("upcoming")).toBeNull();
  });

  it("keeps the page unchanged for a non-member: no tabs and no analytics", () => {
    useOrganizationMock.mockReturnValue({
      organization,
      organizationUsers: undefined,
      organizationUser: undefined,
      isAdminOrOwner: false,
      isMember: false,
      loading: false,
    });

    renderPage();

    expect(screen.queryByRole("button", { name: /statistikk/i })).toBeNull();
    expect(screen.queryByTestId("analytics")).toBeNull();
    expect(screen.getByTestId("profile")).toBeDefined();
    expect(screen.getByTestId("upcoming")).toBeDefined();
  });
});
