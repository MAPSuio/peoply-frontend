import { Organization, UserOrganizationRoles } from "../types/types";
import { fetchFromPeoplyApiJson } from "./fetchers";

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
