import {
  type ArrangerOption,
  type Organization,
  OrganizationRole,
  type User,
} from "../../types/types";
import { getOrganizationRolePrivilege } from "../../utils/functions";

export interface CoOrganizerOption {
  id: string;
  label: string;
}

function administers(organization: Organization, user: User): boolean {
  return organization.organizationRoles.some(
    (userRole) =>
      userRole.userId === user.id &&
      getOrganizationRolePrivilege(userRole.role) >
        getOrganizationRolePrivilege(OrganizationRole.MEMBER),
  );
}

export function arrangerOptionsFor(
  user: User | undefined,
  organizations: Organization[] | undefined,
): ArrangerOption[] {
  if (!user) {
    return [];
  }

  const administered = (organizations ?? [])
    .filter((organization) => administers(organization, user))
    .map((organization) => ({
      label: organization.name,
      value: organization.arrangerId,
      organization,
    }));

  return [
    {
      label: `${user.firstName} ${user.lastName}`,
      value: user.arrangerId,
      user,
    },
    ...administered,
  ];
}

export function coOrganizerOptionsFor(
  organizations: Organization[] | undefined,
  excludedOrganizationId: string | undefined,
): CoOrganizerOption[] {
  return (organizations ?? [])
    .filter((organization) => organization.id !== excludedOrganizationId)
    .map((organization) => ({ id: organization.id, label: organization.name }))
    .sort((left, right) => left.label.localeCompare(right.label, "nb-NO"));
}

export function matchingCoOrganizerOptions(
  options: CoOrganizerOption[],
  search: string,
): CoOrganizerOption[] {
  const term = search.trim().toLowerCase();
  return options.filter((organization) =>
    organization.label.toLowerCase().includes(term),
  );
}
