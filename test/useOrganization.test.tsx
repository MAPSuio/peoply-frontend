import { render, waitFor } from "@testing-library/react";
import type { User } from "../types/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useOrganization from "../hooks/useOrganization";
import { getOrganization } from "../services/organizations";

let currentUser: User | undefined;

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: currentUser }),
}));

vi.mock("../services/organizations", () => ({
  getOrganization: vi.fn(),
  getOrganizationUsers: vi.fn(),
}));

const getOrganizationMock = vi.mocked(getOrganization);

function OrganizationConsumer({ oid }: { oid: string }) {
  useOrganization(oid);
  return null;
}

describe("useOrganization", () => {
  beforeEach(() => {
    getOrganizationMock.mockReset();
    currentUser = { id: "user-1" } as User;
  });

  it("does not refetch a missing organization when the user context refreshes", async () => {
    getOrganizationMock.mockRejectedValue(new Error("Not found"));

    const { rerender } = render(<OrganizationConsumer oid="missing-org" />);

    await waitFor(() => expect(getOrganizationMock).toHaveBeenCalledTimes(1));

    currentUser = { id: "user-1", firstName: "Kari" } as User;
    rerender(<OrganizationConsumer oid="missing-org" />);

    await waitFor(() => expect(getOrganizationMock).toHaveBeenCalledTimes(1));
  });
});
