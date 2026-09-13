import { useRouter } from "next/router";
import { useState } from "react";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import SelectedUserChips from "../../../components/SelectedUserChips";
import UserSelect from "../../../components/UserSelect";
import useBack from "../../../hooks/useBack";
import useOrganization from "../../../hooks/useOrganization";
import RequireUser from "../../../components/RequireUser";
import useRedirectWithReason from "../../../hooks/useRedirectWithReason";
import { inviteBlockedReason } from "../../../utils/organizationAccess";
import useSnack from "../../../hooks/useSnack";
import { fetchFromPeoplyApi } from "../../../services/fetchers";
import styles from "../../../styles/InviteMembersToOrg.module.scss";
import {
  OrganizationRole,
  type OutboundOrganizationInvitation,
  SnackTypes,
  type User,
} from "../../../types/types";

function InviteForm() {
  const goBack = useBack();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { addSnack } = useSnack();
  const router = useRouter();
  const { oid } = router.query;
  const {
    organization,
    organizationUsers,
    isAdminOrOwner,
    loading: organizationsLoading,
    error: organizationError,
  } = useOrganization(oid as string);

  const onUserSelect = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const onUserRemove = (user: User) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
  };

  useRedirectWithReason({
    reason: inviteBlockedReason({
      loading: organizationsLoading,
      signedIn: true,
      isAdminOrOwner,
      fetchFailed: Boolean(organizationError),
    }),
    to: `/orgs/${oid}`,
  });

  if (organizationsLoading) {
    return <></>;
  }

  const onSubmit = async () => {
    if (selectedUsers.length) {
      const invitations: OutboundOrganizationInvitation[] = selectedUsers.map(
        (user) => ({
          userId: user.id,
          role: OrganizationRole.MEMBER,
        }),
      );

      try {
        await fetchFromPeoplyApi(`/organizations/${oid}/invitations`, {
          method: "POST",
          body: JSON.stringify(invitations),
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
        addSnack("Invitasjoner sendt!", SnackTypes.SUCCESS);
      } catch {
        addSnack("Noe gikk galt", SnackTypes.ERROR);
      }
      router.push(`/orgs/${oid}/members`);
    }
  };

  if (organizationUsers && organization) {
    return (
      <>
        <HeadComponent
          title={`${organization.name} - Inviter medlemmer`}
          description="Inviter medlemmer til din organisasjon"
        />
        <div className={styles.container}>
          <BackButton onClick={goBack} />
          <div className={styles.header}>
            <h1>Inviter medlemmer</h1>
            <p>Legg til nye medlemmer i {organization.name}</p>
          </div>
          <SelectedUserChips users={selectedUsers} onRemove={onUserRemove} />
          <UserSelect
            selectedUsers={selectedUsers}
            onUserRemove={onUserRemove}
            onUserSelect={onUserSelect}
            excludeUsers={organizationUsers.map(({ user }) => user)}
          />
          {selectedUsers.length !== 0 && (
            <Button
              className={styles.primaryButton}
              text="Send invitasjoner"
              onClick={onSubmit}
            />
          )}
        </div>
      </>
    );
  }
  return <></>;
}

export default function InviteMembersToOrg() {
  return <RequireUser>{() => <InviteForm />}</RequireUser>;
}
