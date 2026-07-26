import { useRouter } from "next/router";
import { useState } from "react";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import CloseIcon from "../../../components/svgs/CloseIcon";
import UserSelect from "../../../components/UserSelect";
import useBack from "../../../hooks/useBack";
import useOrganization from "../../../hooks/useOrganization";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import { fetchFromPeoplyApi } from "../../../services/fetchers";
import styles from "../../../styles/InviteMembersToOrg.module.scss";
import {
  OrganizationRole,
  type OutboundOrganizationInvitation,
  SnackTypes,
  type User,
} from "../../../types/types";

export default function InviteMembersToOrg() {
  const goBack = useBack();
  const { user, loading } = useUser();
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

  if (loading || organizationsLoading) {
    return <></>;
  }

  if (organizationError) {
    addSnack("Kunne ikke hente organisasjonsdata", SnackTypes.ERROR);
    router.push(`/orgs/${oid}`);
  }

  if (!isAdminOrOwner) {
    addSnack(
      "Du har ikke rettigheter til å invitere ny medlemmer",
      SnackTypes.ERROR,
    );
    router.push(`/orgs/${oid}`);
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

  if (user && organizationUsers && organization) {
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
          <div className={styles.selected}>
            {selectedUsers.length !== 0 && <p>Valgte brukere: </p>}
            {selectedUsers.map((user) => (
              <button
                type="button"
                className={styles.selectedUser}
                key={user.id}
                onClick={() => onUserRemove(user)}
              >
                {`${user.firstName.slice(0, 1).toUpperCase()}. ${
                  user.lastName
                }`}
                <CloseIcon />
              </button>
            ))}
          </div>
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
