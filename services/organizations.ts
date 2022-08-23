import { Organization, UserOrganizationRoles } from "../types/types";
import { fetchFromPeoplyApiJson } from "./fetchers";

// getXOrganizations returns the given amount of organizations.
export function getXOrganizations(numOrgs: number): Promise<Organization[]> {
  const url = `/organizations?take=${numOrgs}`;
  return fetchFromPeoplyApiJson(url);
}

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

// getOrgEvents returns the events for the org with the given ID.
export function getOrgEvents(oid: string) {
  return fetchFromPeoplyApiJson(`/organizations/${oid}/events`);
}
