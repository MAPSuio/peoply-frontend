import { render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import { describe, expect, it, vi } from "vitest";

import OrganizationStats from "../components/organization/OrganizationStats";
import type { Organization } from "../types/types";

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: { id: "u1" }, loading: false }),
}));

const ORGANIZATION = {
  id: "org-1",
  name: "IFI Creators Guild",
  urlId: "ificreatorsguild",
} as Organization;

function renderStats(props: { isMemberOfOrg: boolean }) {
  return render(
    <SWRConfig
      value={{ provider: () => new Map(), fetcher: async () => undefined }}
    >
      <OrganizationStats
        organization={ORGANIZATION}
        memberCount={42}
        eventCount={3}
        {...props}
      />
    </SWRConfig>,
  );
}

describe("organization member stat tile", () => {
  it("links a member to the member list", () => {
    renderStats({ isMemberOfOrg: true });

    expect(screen.getByRole("link", { name: /medlemmer/i })).toHaveAttribute(
      "href",
      "/orgs/ificreatorsguild/members",
    );
  });

  it("shows a non-member the count without linking to the members-only list", () => {
    renderStats({ isMemberOfOrg: false });

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Medlemmer")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /medlemmer/i }),
    ).not.toBeInTheDocument();
  });
});
