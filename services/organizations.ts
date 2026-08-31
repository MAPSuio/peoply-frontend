import type {
  Organization,
  OrganizationRole,
  UserOrganizationRoles,
} from "../types/types";
import { fetchFromPeoplyApi, fetchFromPeoplyApiJson } from "./fetchers";

// getOrganization returns an organization with the given ID.
export function getOrganization(oid: string): Promise<Organization> {
  return fetchFromPeoplyApiJson(`/organizations/${oid}`);
}

// getOrganizationUsers gets all users for the org with the given ID.
export function getOrganizationUsers(
  oid: string,
): Promise<UserOrganizationRoles[]> {
  return fetchFromPeoplyApiJson(`/organizations/${oid}/members`);
}

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

// removeOrganizationMember takes a user out of the organization.
export function removeOrganizationMember(oid: string, userId: string) {
  return fetchFromPeoplyApi(`/organizations/${oid}/members/${userId}`, {
    method: "DELETE",
  });
}

// transferOrganizationOwnership hands ownership to an existing member.
export function transferOrganizationOwnership(oid: string, newOwnerId: string) {
  return fetchFromPeoplyApi(`/organizations/${oid}/owner`, {
    method: "PATCH",
    body: JSON.stringify({ newOwnerId }),
    headers: JSON_HEADERS,
  });
}

// setOrganizationMemberRole changes what a member is allowed to do.
export function setOrganizationMemberRole(
  oid: string,
  userId: string,
  role: OrganizationRole,
) {
  return fetchFromPeoplyApiJson(`/organizations/${oid}/roles`, {
    method: "PATCH",
    body: JSON.stringify({ role, userId }),
    headers: JSON_HEADERS,
  });
}

// setOwnRoleDescription changes the caller's own title in the organization.
export function setOwnRoleDescription(
  oid: string,
  userId: string,
  description: string,
) {
  return fetchFromPeoplyApiJson(
    `/organizations/${oid}/roleDescription/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ description }),
      headers: JSON_HEADERS,
    },
  );
}

export interface MemberEdit {
  organizationId: string;
  member: UserOrganizationRoles;
  editorId: string;
  isEditingSelf: boolean;
  roleDescription: string;
  role?: OrganizationRole;
}

/**
 * Saves whatever the member edit form actually changed.
 *
 * The title and the role are separate endpoints, and sending an unchanged
 * value is a write the API has to answer for nothing, so each call is made
 * only when its own field moved.
 */
export async function saveMemberEdit({
  organizationId,
  member,
  editorId,
  isEditingSelf,
  roleDescription,
  role,
}: MemberEdit) {
  if (isEditingSelf && member.roleDescription !== roleDescription) {
    await setOwnRoleDescription(organizationId, editorId, roleDescription);
  }

  if (role && member.role !== role) {
    await setOrganizationMemberRole(organizationId, member.userId, role);
  }
}
