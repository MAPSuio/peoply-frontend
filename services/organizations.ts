import { Organization, UserOrganizationRoles } from "../types/types";
import { fetchFromPeoplyApiJson } from "./fetchers";

export function getOrganization(oid: string): Promise<Organization> {
  return fetchFromPeoplyApiJson(`/organizations/${oid}`);
}

export function getOrganizationUsers(
  oid: string,
): Promise<UserOrganizationRoles[]> {
  return fetchFromPeoplyApiJson(`/organizations/${oid}/members`);
}
