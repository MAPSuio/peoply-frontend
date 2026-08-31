import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Members from "../pages/orgs/[oid]/members/index";
import useOrganization from "../hooks/useOrganization";
import { type Organization, SnackTypes } from "../types/types";

const push = vi.fn();
const replace = vi.fn();
const addSnack = vi.fn();
const redirectToLogin = vi.fn();

/* Next's router is a singleton whose identity is stable across renders, and
   only its query fills in once the URL has been parsed. */
let routerQuery: { oid?: string } = { oid: "ificreatorsguild" };
const router = {
  get query() {
    return routerQuery;
  },
  push,
  replace,
  back: vi.fn(),
};

vi.mock("next/router", () => ({ useRouter: () => router }));

vi.mock("../hooks/useOrganization", () => ({ default: vi.fn() }));
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));
vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: { id: "u1" }, loading: false }),
}));
vi.mock("../hooks/useRedirectToLogin", () => ({
  default: () => redirectToLogin,
}));
vi.mock("../components/HeadComponent", () => ({ default: () => null }));

const useOrganizationMock = vi.mocked(useOrganization);

const ORGANIZATION = {
  id: "org-1",
  name: "IFI Creators Guild",
  urlId: "ificreatorsguild",
} as Organization;

describe("members page for a user without access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routerQuery = { oid: "ificreatorsguild" };
    useOrganizationMock.mockReturnValue({
      organization: ORGANIZATION,
      organizationUsers: undefined,
      membersForbidden: true,
      loading: false,
    });
  });

  it("replaces the entry instead of pushing, so back does not land here again", async () => {
    render(<Members />);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild"),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("explains the missing access once, not once per render", async () => {
    const { rerender } = render(<Members />);
    rerender(<Members />);
    rerender(<Members />);

    await waitFor(() => expect(addSnack).toHaveBeenCalled());
    expect(addSnack).toHaveBeenCalledTimes(1);
    expect(addSnack).toHaveBeenCalledWith(
      "Bare medlemmer kan se medlemslisten",
      SnackTypes.ERROR,
    );
  });

  it("waits for the router before redirecting, and then redirects once", async () => {
    routerQuery = {};
    const { rerender } = render(<Members />);

    expect(replace).not.toHaveBeenCalled();

    routerQuery = { oid: "ificreatorsguild" };
    rerender(<Members />);
    rerender(<Members />);

    await waitFor(() => expect(replace).toHaveBeenCalledOnce());
    expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild");
    expect(addSnack).toHaveBeenCalledTimes(1);
  });

  it("says the list could not be fetched when the API failed rather than refused", async () => {
    useOrganizationMock.mockReturnValue({
      organization: ORGANIZATION,
      organizationUsers: undefined,
      membersForbidden: false,
      loading: false,
      error: "Something went wrong when fetching organization data",
    });

    render(<Members />);

    await waitFor(() => expect(addSnack).toHaveBeenCalled());
    expect(addSnack).toHaveBeenCalledWith(
      "Kunne ikke hente medlemslisten",
      SnackTypes.ERROR,
    );
  });
});
