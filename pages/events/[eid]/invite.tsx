import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import CloseIcon from "../../../components/svgs/CloseIcon";
import UserSelect from "../../../components/UserSelect";
import useBack from "../../../hooks/useBack";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../../services/fetchers";
import styles from "../../../styles/InviteMembersToOrg.module.scss";
import { SnackTypes, User, Event } from "../../../types/types";

export default function InviteUsersToEvent() {
  const goBack = useBack();
  const { user, loading } = useUser();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { addSnack } = useSnack();
  const router = useRouter();
  const { eid } = router.query;
  const { data: event, error: eventError } = useSWR<Event>(
    () => (eid ? `/events/${eid}` : false),
    fetchFromPeoplyApiJson,
  );

  const onUserSelect = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const onUserRemove = (user: User) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
  };

  if (loading) {
    return <></>;
  }

  if (eventError) {
    addSnack("Kunne ikke hente arrangementet", SnackTypes.ERROR);
    router.push(`/events/${eid}`);
  }

  const onSubmit = async () => {
    if (selectedUsers.length) {
      const invitations: string[] = selectedUsers.map(({ id }) => id);

      try {
        await fetchFromPeoplyApi(`/events/${event?.id}/invitations`, {
          method: "POST",
          body: JSON.stringify(invitations),
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
        addSnack("Invitasjoner sendt!", SnackTypes.SUCCESS);
      } catch (e) {
        addSnack("Noe gikk galt", SnackTypes.ERROR);
      }
      router.push(`/events/${eid}`);
    }
  };

  if (user && event) {
    return (
      <>
        <HeadComponent
          title={`${event.title} - Inviter`}
          description="Inviter brukere til arrangementet"
        />
        <div className={styles.container}>
          <BackButton onClick={goBack} />
          <div className={styles.header}>
            <h1>Inviter brukere</h1>
            <p>
              Inviter andre til å bli med på <span>{event.title}</span>
            </p>
          </div>
          <div className={styles.selected}>
            {selectedUsers.length !== 0 && <p>Valgte brukere: </p>}
            {selectedUsers.map((user) => (
              <button
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
