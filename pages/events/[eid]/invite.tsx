import { useRouter } from "next/router";
import useSWR from "swr";

import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Dropdown from "../../../components/Dropdown";
import ExpandableCard from "../../../components/ExpandableCard";
import HeadComponent from "../../../components/HeadComponent";
import RequireUser from "../../../components/RequireUser";
import UserSelect from "../../../components/UserSelect";
import SelectedUserChips from "../../../components/SelectedUserChips";
import PlusIcon from "../../../components/svgs/PlusIcon";
import useBack from "../../../hooks/useBack";
import useEventInvitations from "../../../hooks/useEventInvitations";
import useRedirectWithReason, {
  blockingReason,
} from "../../../hooks/useRedirectWithReason";
import {
  ButtonSize,
  ButtonType,
  type Event,
  type User,
} from "../../../types/types";

import styles from "../../../styles/InviteMembersToOrg.module.scss";

function EventInviteForm({ user }: { user: User }) {
  const goBack = useBack();
  const router = useRouter();
  const { eid } = router.query;
  const { data: event, error: eventError } = useSWR<Event>(() =>
    eid ? `/events/${eid}` : false,
  );
  const invitations = useEventInvitations(user, event?.id);

  useRedirectWithReason({
    reason: blockingReason(true, [
      {
        blocked: Boolean(eventError),
        reason: "Kunne ikke hente arrangementet",
      },
    ]),
    to: `/events/${eid}`,
  });

  if (!event) {
    return <></>;
  }

  return (
    <>
      <HeadComponent
        title={`${event.title} - Inviter`}
        description="Inviter brukere til arrangementet"
      />
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.contentContainer}>
          <div className={styles.header}>
            <h1>Inviter brukere</h1>
            <p>
              Inviter andre til å bli med på <span>{event.title}</span>
            </p>
          </div>
          {invitations.arrangerOptions.length > 0 && (
            <ExpandableCard title="Inviter medlemmer fra din organisasjon">
              <div className={styles.inviteOrgContainer}>
                <Dropdown
                  options={invitations.arrangerOptions}
                  value={invitations.orgArrangerId}
                  inputId="arrangerInput"
                  className={styles.arrangerInput}
                  setValue={invitations.setOrgArrangerId}
                  card
                />
                <Button
                  icon={<PlusIcon className={styles.addIcon} />}
                  size={ButtonSize.TINY}
                  type={ButtonType.PRIMARY}
                  text=""
                  onClick={invitations.addOrganizationMembers}
                />
              </div>
            </ExpandableCard>
          )}
          <SelectedUserChips
            users={invitations.selectedUsers}
            onRemove={invitations.removeUser}
            closeIconClassName={styles.closeIcon}
          />
          <UserSelect
            selectedUsers={invitations.selectedUsers}
            onUserRemove={invitations.removeUser}
            onUserSelect={invitations.selectUser}
          />
        </div>
        {invitations.selectedUsers.length > 0 && (
          <Button
            className={styles.primaryButton}
            text="Send invitasjoner"
            onClick={invitations.submit}
          />
        )}
      </div>
    </>
  );
}

export default function InviteUsersToEvent() {
  return <RequireUser>{(user) => <EventInviteForm user={user} />}</RequireUser>;
}
