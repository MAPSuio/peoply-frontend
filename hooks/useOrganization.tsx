import useSWR from "swr";
import {
  getOrganization,
  getOrganizationUsers,
} from "../services/organizations";
import {
  type Organization,
  OrganizationRole,
  type UserOrganizationRoles,
} from "../types/types";
import useUser from "./useUser";

interface useOrganizationUsersType {
  organization?: Organization;
  organizationUsers?: UserOrganizationRoles[];
  organizationUser?: UserOrganizationRoles;
  isAdmin?: boolean;
  isMember?: boolean;
  isOwner?: boolean;
  isAdminOrOwner?: boolean;
  loading?: boolean;
  error?: string;
}

interface UseOrganizationOptions {
  fetchMembers?: boolean;
}

/**
 * An organization and, for a signed-in user, its members with their roles.
 *
 * Backed by SWR rather than useState and useEffect. The effect version cleared
 * the organization and went back to loading on every mount, so a page that had
 * already shown an organization blanked out and fetched it again when you
 * navigated back to it - and anything keyed off `organization.id`, like the
 * organization's event list, could not start until that round trip finished.
 * SWR serves the cached organization on the next mount and revalidates behind
 * the rendered page.
 */
/** The signed-in user's standing in the organization, from their membership. */
function rolesOf(organizationUser?: UserOrganizationRoles) {
  const role = organizationUser?.role;
  const isOwner = role === OrganizationRole.OWNER;
  const isAdmin = role === OrganizationRole.ADMIN;

  return {
    isOwner,
    isAdmin,
    isAdminOrOwner: isAdmin || isOwner,
    isMember: role === OrganizationRole.MEMBER,
  };
}

/**
 * The organization's members. Keyed off the organization's id while the
 * organization itself is keyed off whatever the URL used, slug or id; both stay
 * stable across mounts, which is what makes the cache hit.
 */
function useOrganizationMembers(wanted: boolean, organization?: Organization) {
  const key =
    wanted && organization ? `/organizations/${organization.id}/members` : null;

  const { data, error, isLoading } = useSWR<UserOrganizationRoles[]>(key, () =>
    getOrganizationUsers((organization as Organization).id),
  );

  return { members: data, membersError: error, membersLoading: isLoading };
}

export default function useOrganization(
  oid: string,
  options: UseOrganizationOptions = {},
): useOrganizationUsersType {
  const { user, loading: userLoading } = useUser();
  const { fetchMembers = true } = options;

  const {
    data: organization,
    error: organizationError,
    isLoading: organizationLoading,
  } = useSWR<Organization>(oid ? `/organizations/${oid}` : null, () =>
    getOrganization(oid),
  );

  const { members, membersError, membersLoading } = useOrganizationMembers(
    Boolean(fetchMembers && user),
    organization,
  );

  const organizationUser = members?.find((u) => u.user.id === user?.id);

  return {
    organization,
    organizationUsers: members,
    organizationUser,
    ...rolesOf(organizationUser),
    /* Still loading while the user is being resolved and members are wanted:
       callers gate the whole page on this, and letting it fall to false early
       would flash the page without the admin-only controls. */
    loading:
      organizationLoading || (fetchMembers && (userLoading || membersLoading)),
    error:
      organizationError || membersError
        ? "Something went wrong when fetching organization data"
        : undefined,
  };
}
