import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MemberEditForm from "../components/organization/MemberEditForm";
import {
  removeOrganizationMember,
  saveMemberEdit,
} from "../services/organizations";
import {
  type Organization,
  OrganizationRole,
  type UserOrganizationRoles,
} from "../types/types";

const replace = vi.fn();
const addSnack = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({
    replace,
    push: vi.fn(),
    back: vi.fn(),
    query: {},
    isReady: true,
  }),
}));
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));
vi.mock("../services/organizations", () => ({
  removeOrganizationMember: vi.fn(),
  transferOrganizationOwnership: vi.fn(),
  saveMemberEdit: vi.fn(),
}));

const saveMemberEditMock = vi.mocked(saveMemberEdit);
const removeMemberMock = vi.mocked(removeOrganizationMember);

const ORGANIZATION = {
  id: "org-1",
  name: "IFI Creators Guild",
  urlId: "ificreatorsguild",
} as Organization;

const membership = (role: OrganizationRole, userId: string) =>
  ({
    role,
    userId,
    roleDescription: "Medlem",
    user: { id: userId, firstName: "Kari", lastName: "Nordmann" },
  }) as UserOrganizationRoles;

const MEMBER = membership(OrganizationRole.MEMBER, "member-1");
const OWNER = membership(OrganizationRole.OWNER, "owner-1");

function renderForm(overrides: Partial<Parameters<typeof MemberEditForm>[0]>) {
  return render(
    <MemberEditForm
      organization={ORGANIZATION}
      member={MEMBER}
      editorId="owner-1"
      viewer={{ isOwner: true, isAdminOrOwner: true, membership: OWNER }}
      onBack={vi.fn()}
      {...overrides}
    />,
  );
}

describe("MemberEditForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("offers an owner both irreversible options for a plain member", () => {
    renderForm({});

    expect(
      screen.getByText("Fjern bruker fra organisasjonen"),
    ).toBeInTheDocument();
    expect(screen.getByText("Gjør brukeren til eier")).toBeInTheDocument();
  });

  it("offers a plain member editing themselves only the way out", () => {
    renderForm({
      member: MEMBER,
      editorId: "member-1",
      viewer: { isOwner: false, isAdminOrOwner: false, membership: MEMBER },
    });

    expect(
      screen.getByText("Fjern meg fra organisasjonen"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Fjern bruker fra organisasjonen"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Gjør brukeren til eier"),
    ).not.toBeInTheDocument();
  });

  it("keeps you on the form when saving fails", async () => {
    saveMemberEditMock.mockRejectedValue(new Error("boom"));
    renderForm({});

    await userEvent.selectOptions(screen.getByLabelText(/rolle/i), "ADMIN");
    await userEvent.click(screen.getByText("Lagre endringer"));

    await waitFor(() => expect(saveMemberEditMock).toHaveBeenCalled());
    expect(replace).not.toHaveBeenCalled();
  });

  it("returns to the member list once a removal succeeds", async () => {
    removeMemberMock.mockResolvedValue(undefined as never);
    renderForm({});

    await userEvent.click(screen.getByText("Fjern bruker fra organisasjonen"));
    await userEvent.click(screen.getByText("Fjern bruker"));

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild/members"),
    );
  });
});
