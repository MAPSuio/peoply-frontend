import { useEffect, useState } from "react";
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

/* Hook to fetch the members along with their roles for a given organization */
export default function useOrganization(
  oid: string,
  options: UseOrganizationOptions = {},
): useOrganizationUsersType {
  const { user, loading: userLoading } = useUser();
  const userId = user?.id;
  const { fetchMembers = true } = options;
  const [organizationUsers, setOrganizationUsers] =
    useState<UserOrganizationRoles[]>();
  const [organization, setOrganization] = useState<Organization>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let active = true;

    async function fetchOrganization() {
      setLoading(true);
      setError(undefined);
      setOrganization(undefined);
      setOrganizationUsers(undefined);

      try {
        const organization = await getOrganization(oid);

        if (!organization) {
          throw new Error(
            "Either the organization does not exist, or we could not fetch it",
          );
        }

        if (!active) {
          return;
        }

        setOrganization(organization);

        if (fetchMembers && userId) {
          const organizationUsers = await getOrganizationUsers(organization.id);

          if (!active) {
            return;
          }

          setOrganizationUsers(organizationUsers);
        }
      } catch {
        if (active) {
          setError("Something went wrong when fetching organization data");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (oid && (!fetchMembers || !userLoading)) {
      void fetchOrganization();
    }

    return () => {
      active = false;
    };
  }, [fetchMembers, oid, userId, userLoading]);

  /* find the authenticated user in the organization */
  const organizationUser = organizationUsers?.find((u) => u.user.id === userId);

  const isOwner = organizationUser?.role === OrganizationRole.OWNER;
  const isAdmin = organizationUser?.role === OrganizationRole.ADMIN;
  const isAdminOrOwner = isAdmin || isOwner;
  const isMember = organizationUser?.role === OrganizationRole.MEMBER;

  return {
    organization,
    organizationUsers,
    organizationUser,
    isAdmin,
    isMember,
    isOwner,
    isAdminOrOwner,
    loading,
    error,
  };
}
