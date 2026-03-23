import { useEffect, useState } from "react";
import {
  getOrganization,
  getOrganizationUsers,
} from "../services/organizations";
import {
  Organization,
  OrganizationRole,
  UserOrganizationRoles,
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

/* Hook to fetch the members along with their roles for a given organization */
export default function useOrganization(oid: string): useOrganizationUsersType {
  const { user } = useUser();
  const [organizationUsers, setOrganizationUsers] =
    useState<UserOrganizationRoles[]>();
  const [organization, setOrganization] = useState<Organization>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchOrganizationUsers() {
      setLoading(true);
      try {
        /* fetch organization data */
        const organization = await getOrganization(oid);
        setOrganization(organization);

        if (!organization) {
          throw new Error(
            "Either the organization does not exist, or we could not fetch it",
          );
        }

        if (user) {
          try {
            const organizationUsers = await getOrganizationUsers(
              organization.id,
            );
            setOrganizationUsers(organizationUsers);
          } catch (error) {
            setOrganizationUsers(undefined);
          }
        } else {
          setOrganizationUsers(undefined);
        }
      } catch (error) {
        setError("Something went wrong when fetching organization data");
      }
      setLoading(false);
    }
    if (oid) {
      fetchOrganizationUsers();
    }
  }, [oid, user]);

  /* find the authenticated user in the organization */
  const organizationUser = organizationUsers?.find(
    (u) => u.user.id === user?.id,
  );

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
