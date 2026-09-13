import { useEffect, useState } from "react";

import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";
import {
  type Organization,
  OrganizationRole,
  SnackTypes,
  type User,
} from "../types/types";
import { getOrganizationRolePrivilege } from "../utils/functions";
import useBack from "./useBack";
import useSnack from "./useSnack";
import useUser from "./useUser";

function administers(organization: Organization, user: User): boolean {
  return organization.organizationRoles.some(
    (userRole) =>
      userRole.userId === user.id &&
      getOrganizationRolePrivilege(userRole.role) >
        getOrganizationRolePrivilege(OrganizationRole.MEMBER),
  );
}

export default function useEventInvitations(
  user: User,
  eventId: string | undefined,
) {
  const goBack = useBack();
  const { orgs } = useUser();
  const { addSnack } = useSnack();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [orgArrangerId, setOrgArrangerId] = useState<string>();

  const arrangerOptions = (orgs ?? [])
    .filter((org) => administers(org, user))
    .map((org) => ({ label: org.name, value: org.arrangerId }));

  const firstArrangerId = arrangerOptions[0]?.value;

  useEffect(() => {
    setOrgArrangerId((current) => current ?? firstArrangerId);
  }, [firstArrangerId]);

  const addOrganizationMembers = async () => {
    const org = orgs?.find(
      (candidate) => candidate.arrangerId === orgArrangerId,
    );

    if (!org) {
      return;
    }

    const members: Array<{ user: User }> = await fetchFromPeoplyApiJson(
      `/organizations/${org.id}/members`,
    );

    setSelectedUsers((current) => {
      const alreadyListed = new Set([user.id, ...current.map(({ id }) => id)]);
      const added = members
        .map((member) => member.user)
        .filter((member) => !alreadyListed.has(member.id));

      return [...current, ...added];
    });
  };

  const submit = async () => {
    try {
      await fetchFromPeoplyApi(`/events/${eventId}/invitations`, {
        method: "POST",
        body: JSON.stringify(selectedUsers.map(({ id }) => id)),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      addSnack("Invitasjoner sendt!", SnackTypes.SUCCESS);
    } catch {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
    goBack();
  };

  return {
    selectedUsers,
    selectUser: (selected: User) =>
      setSelectedUsers((current) => [...current, selected]),
    removeUser: (removed: User) =>
      setSelectedUsers((current) =>
        current.filter((candidate) => candidate.id !== removed.id),
      ),
    arrangerOptions,
    orgArrangerId,
    setOrgArrangerId,
    addOrganizationMembers,
    submit,
  };
}
