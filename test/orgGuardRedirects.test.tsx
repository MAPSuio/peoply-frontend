import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import InviteMembersToOrg from "../pages/orgs/[oid]/invite";
import EditOrganizationUser from "../pages/orgs/[oid]/members/[uid]/edit";
import useOrganization from "../hooks/useOrganization";
import useUser from "../hooks/useUser";
import {
  type Organization,
  OrganizationRole,
  SnackTypes,
  type UserOrganizationRoles,
} from "../types/types";

const push = vi.fn();
const replace = vi.fn();
const addSnack = vi.fn();

let routerQuery: { oid?: string; uid?: string } = {
  oid: "ificreatorsguild",
  uid: "member-1",
};
const router = {
  get query() {
    return routerQuery;
  },
  push,
  replace,
  back: vi.fn(),
  isReady: true,
};

vi.mock("next/router", () => ({ useRouter: () => router }));
vi.mock("../hooks/useOrganization", () => ({ default: vi.fn() }));
vi.mock("../hooks/useUser", () => ({ default: vi.fn() }));
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));
vi.mock("../components/HeadComponent", () => ({ default: () => null }));
vi.mock("../components/UserSelect", () => ({ default: () => null }));

const useOrganizationMock = vi.mocked(useOrganization);
const useUserMock = vi.mocked(useUser);

const ORGANIZATION = {
  id: "org-1",
  name: "IFI Creators Guild",
} as Organization;

const memberOf = (role: OrganizationRole, userId: string) =>
  ({
    role,
    userId,
    roleDescription: "",
    user: { id: userId, firstName: "Kari", lastName: "Nordmann" },
  }) as UserOrganizationRoles;

beforeEach(() => {
  vi.clearAllMocks();
  routerQuery = { oid: "ificreatorsguild", uid: "member-1" };
  useUserMock.mockReturnValue({
    user: { id: "member-1", firstName: "Kari", lastName: "Nordmann" },
    loading: false,
  } as ReturnType<typeof useUser>);
});

describe("invite page guard", () => {
  it("turns a plain member away without leaving the page in the history", () => {
    useOrganizationMock.mockReturnValue({
      organization: ORGANIZATION,
      organizationUsers: [memberOf(OrganizationRole.MEMBER, "member-1")],
      isAdminOrOwner: false,
      loading: false,
    });

    render(<InviteMembersToOrg />);

    expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild");
    expect(push).not.toHaveBeenCalled();
    expect(addSnack).toHaveBeenCalledWith(
      "Du har ikke rettigheter til å invitere nye medlemmer",
      SnackTypes.ERROR,
    );
  });

  it("lets an admin stay", () => {
    useOrganizationMock.mockReturnValue({
      organization: ORGANIZATION,
      organizationUsers: [memberOf(OrganizationRole.ADMIN, "member-1")],
      isAdminOrOwner: true,
      loading: false,
    });

    render(<InviteMembersToOrg />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("says the data could not be fetched when that is what happened", () => {
    useOrganizationMock.mockReturnValue({
      organization: undefined,
      organizationUsers: undefined,
      isAdminOrOwner: undefined,
      loading: false,
      error: "Something went wrong when fetching organization data",
    });

    render(<InviteMembersToOrg />);

    expect(addSnack).toHaveBeenCalledWith(
      "Kunne ikke hente organisasjonsdata",
      SnackTypes.ERROR,
    );
  });
});

describe("member edit page guard", () => {
  it("lets a member edit their own membership", () => {
    useOrganizationMock.mockReturnValue({
      organization: ORGANIZATION,
      organizationUsers: [memberOf(OrganizationRole.MEMBER, "member-1")],
      isAdminOrOwner: false,
      loading: false,
    });

    render(<EditOrganizationUser />);

    expect(replace).not.toHaveBeenCalled();
  });

  it("turns away a member editing someone else, with replace", () => {
    routerQuery = { oid: "ificreatorsguild", uid: "member-2" };
    useOrganizationMock.mockReturnValue({
      organization: ORGANIZATION,
      organizationUsers: [
        memberOf(OrganizationRole.MEMBER, "member-1"),
        memberOf(OrganizationRole.MEMBER, "member-2"),
      ],
      isAdminOrOwner: false,
      loading: false,
    });

    render(<EditOrganizationUser />);

    expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild/members");
    expect(push).not.toHaveBeenCalled();
    expect(addSnack).toHaveBeenCalledWith(
      "Du har ikke rettigheter til dette",
      SnackTypes.ERROR,
    );
  });

  it("says so when the member is not in the organization", () => {
    routerQuery = { oid: "ificreatorsguild", uid: "stranger" };
    useOrganizationMock.mockReturnValue({
      organization: ORGANIZATION,
      organizationUsers: [memberOf(OrganizationRole.OWNER, "member-1")],
      isAdminOrOwner: true,
      loading: false,
    });

    render(<EditOrganizationUser />);

    expect(addSnack).toHaveBeenCalledWith(
      "Denne brukeren er ikke medlem i organisasjonen",
      SnackTypes.ERROR,
    );
    expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild/members");
  });
});
