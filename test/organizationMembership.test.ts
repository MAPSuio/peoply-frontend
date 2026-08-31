import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  removeOrganizationMember,
  setOrganizationMemberRole,
  setOwnRoleDescription,
  transferOrganizationOwnership,
} from "../services/organizations";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";
import { OrganizationRole } from "../types/types";

vi.mock("../services/fetchers", () => ({
  fetchFromPeoplyApi: vi.fn(),
  fetchFromPeoplyApiJson: vi.fn(),
}));

const apiMock = vi.mocked(fetchFromPeoplyApi);
const apiJsonMock = vi.mocked(fetchFromPeoplyApiJson);

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

describe("organization membership mutations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes a member", async () => {
    await removeOrganizationMember("org-1", "user-2");

    expect(apiMock).toHaveBeenCalledWith(
      "/organizations/org-1/members/user-2",
      {
        method: "DELETE",
      },
    );
  });

  it("hands ownership to another member", async () => {
    await transferOrganizationOwnership("org-1", "user-2");

    expect(apiMock).toHaveBeenCalledWith("/organizations/org-1/owner", {
      method: "PATCH",
      body: JSON.stringify({ newOwnerId: "user-2" }),
      headers: JSON_HEADERS,
    });
  });

  it("changes a member's role", async () => {
    await setOrganizationMemberRole("org-1", "user-2", OrganizationRole.ADMIN);

    expect(apiJsonMock).toHaveBeenCalledWith("/organizations/org-1/roles", {
      method: "PATCH",
      body: JSON.stringify({
        role: OrganizationRole.ADMIN,
        userId: "user-2",
      }),
      headers: JSON_HEADERS,
    });
  });

  it("changes your own title in the organization", async () => {
    await setOwnRoleDescription("org-1", "user-1", "Leder");

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/organizations/org-1/roleDescription/user-1",
      {
        method: "PATCH",
        body: JSON.stringify({ description: "Leder" }),
        headers: JSON_HEADERS,
      },
    );
  });
});
