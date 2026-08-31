import { act, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { SWRConfig } from "swr";
import type { Organization, User, UserOrganizationRoles } from "../types/types";
import { OrganizationRole } from "../types/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useOrganization from "../hooks/useOrganization";
import { ApiError } from "../services/apiError";
import {
  getOrganization,
  getOrganizationUsers,
} from "../services/organizations";

let currentUser: User | undefined;
let userLoading = false;

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: currentUser, loading: userLoading }),
}));

vi.mock("../services/organizations", () => ({
  getOrganization: vi.fn(),
  getOrganizationUsers: vi.fn(),
}));

const getOrganizationMock = vi.mocked(getOrganization);
const getOrganizationUsersMock = vi.mocked(getOrganizationUsers);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

function OrganizationConsumer({
  oid,
  fetchMembers,
}: {
  oid: string;
  fetchMembers?: boolean;
}) {
  const state = useOrganization(oid, { fetchMembers });
  return (
    <output data-testid="state">
      {JSON.stringify({
        organizationId: state.organization?.id,
        isAdmin: state.isAdmin,
        loading: state.loading,
        error: state.error,
        membersForbidden: state.membersForbidden,
      })}
    </output>
  );
}

const organization = { id: "org-1" } as Organization;
const adminMember = {
  role: OrganizationRole.ADMIN,
  user: { id: "user-1" },
} as UserOrganizationRoles;

function state() {
  return JSON.parse(screen.getByTestId("state").textContent ?? "{}");
}

/* A cache of its own per test. SWR's default cache is module global, so
   without this the second test to ask for org-1 is served from what the first
   one left behind and never calls the fetcher at all. Retries are off so an
   errored key stays errored for the length of a test. */
function renderWithSwr(ui: ReactElement) {
  const wrap = (node: ReactElement) => (
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        shouldRetryOnError: false,
      }}
    >
      {node}
    </SWRConfig>
  );

  const result = render(wrap(ui));

  return {
    ...result,
    rerender: (next: ReactElement) => result.rerender(wrap(next)),
  };
}

describe("useOrganization", () => {
  beforeEach(() => {
    getOrganizationMock.mockReset();
    getOrganizationUsersMock.mockReset();
    currentUser = { id: "user-1" } as User;
    userLoading = false;
  });

  it("does not refetch a missing organization on a same-ID user rerender", async () => {
    getOrganizationMock.mockRejectedValue(new Error("Not found"));

    const { rerender } = renderWithSwr(
      <OrganizationConsumer oid="missing-org" />,
    );

    await waitFor(() => expect(state().loading).toBe(false));

    currentUser = { id: "user-1", firstName: "Kari" } as User;
    rerender(<OrganizationConsumer oid="missing-org" />);

    expect(getOrganizationMock).toHaveBeenCalledTimes(1);
    expect(getOrganizationUsersMock).not.toHaveBeenCalled();
  });

  it("keeps loading while members are pending before granting admin access", async () => {
    const members = deferred<UserOrganizationRoles[]>();
    getOrganizationMock.mockResolvedValue(organization);
    getOrganizationUsersMock.mockReturnValue(members.promise);

    renderWithSwr(<OrganizationConsumer oid="org-1" />);

    await waitFor(() =>
      expect(getOrganizationUsersMock).toHaveBeenCalledOnce(),
    );
    expect(state()).toMatchObject({ organizationId: "org-1", loading: true });
    expect(state().isAdmin).toBe(false);

    await act(() => {
      members.resolve([adminMember]);
      return members.promise;
    });

    expect(state()).toMatchObject({
      organizationId: "org-1",
      isAdmin: true,
      loading: false,
    });
  });

  it("reports a 403 on the member list as forbidden rather than as a failure", async () => {
    getOrganizationMock.mockResolvedValue(organization);
    getOrganizationUsersMock.mockRejectedValue(
      new ApiError("Forbidden", 403, "/organizations/org-1/members"),
    );

    renderWithSwr(<OrganizationConsumer oid="org-1" />);

    await waitFor(() => expect(state().loading).toBe(false));
    expect(state().membersForbidden).toBe(true);
  });

  it("reports a failed member list as an error, not as forbidden", async () => {
    getOrganizationMock.mockResolvedValue(organization);
    getOrganizationUsersMock.mockRejectedValue(
      new ApiError("Boom", 500, "/organizations/org-1/members"),
    );

    renderWithSwr(<OrganizationConsumer oid="org-1" />);

    await waitFor(() => expect(state().loading).toBe(false));
    expect(state().membersForbidden).toBe(false);
    expect(state().error).toBeTruthy();
  });

  it("skips members when fetchMembers is false", async () => {
    getOrganizationMock.mockResolvedValue(organization);

    renderWithSwr(<OrganizationConsumer oid="org-1" fetchMembers={false} />);

    await waitFor(() => expect(state().loading).toBe(false));
    expect(getOrganizationMock).toHaveBeenCalledOnce();
    expect(getOrganizationUsersMock).not.toHaveBeenCalled();
  });

  it("ignores a stale response after the organization ID changes", async () => {
    const oldOrganization = deferred<Organization>();
    getOrganizationMock.mockImplementation((oid) =>
      oid === "org-1"
        ? oldOrganization.promise
        : Promise.resolve({ id: oid } as Organization),
    );

    const { rerender } = renderWithSwr(
      <OrganizationConsumer oid="org-1" fetchMembers={false} />,
    );
    rerender(<OrganizationConsumer oid="org-2" fetchMembers={false} />);

    await waitFor(() =>
      expect(state()).toMatchObject({
        organizationId: "org-2",
        loading: false,
      }),
    );

    await act(() => {
      oldOrganization.resolve({ id: "org-1" } as Organization);
      return oldOrganization.promise;
    });

    expect(state()).toMatchObject({
      organizationId: "org-2",
      loading: false,
    });
  });
});
