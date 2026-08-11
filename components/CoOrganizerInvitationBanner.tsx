// React.
import { useState } from "react";

// Components.
import Button from "./Button";

// Hooks.
import useNotifications from "../hooks/useNotifications";
import useSnack from "../hooks/useSnack";

// Services.
import { respondToCoOrganizerInvitation } from "../services/coOrganizerInvitations";

// Types.
import {
  ButtonType,
  type CoOrganizerInvitationNotification,
  InvitationStatus,
  NotificationType,
  SnackTypes,
} from "../types/types";

// Styles.
import styles from "../styles/CoOrganizerInvitationBanner.module.scss";

interface CoOrganizerInvitationBannerProps {
  eventId: string;
  /* Called after an accept, so the page can refetch and show the organization
     among the arrangers it just joined. */
  onAnswered?: () => void;
}

/**
 * Lets an organization admin answer a pending co-organizer invitation from the
 * event itself, rather than having to go find it under Varsler.
 *
 * The invitations come from the notification feed the whole app already polls:
 * the API only hands a user the invitations addressed to organizations where
 * they are ADMIN or OWNER, so anything that reaches this component is
 * something the current user is allowed to answer. Nobody else sees a banner.
 */
export default function CoOrganizerInvitationBanner({
  eventId,
  onAnswered,
}: CoOrganizerInvitationBannerProps) {
  const { notifications, reload } = useNotifications();
  const { addSnack } = useSnack();
  const [busyInvitationId, setBusyInvitationId] = useState<string>();

  const invitations = (notifications ?? []).filter(
    (notification): notification is CoOrganizerInvitationNotification =>
      notification.type === NotificationType.INVITATION_EVENT_COORGANIZER &&
      (notification as CoOrganizerInvitationNotification).eventId === eventId,
  );

  if (invitations.length === 0) {
    return null;
  }

  const respond = async (
    invitation: CoOrganizerInvitationNotification,
    status: InvitationStatus,
  ) => {
    setBusyInvitationId(invitation.id);
    try {
      await respondToCoOrganizerInvitation(eventId, invitation.id, status);
      addSnack(
        status === InvitationStatus.ACCEPTED
          ? `${invitation.organization.name} er nå medarrangør`
          : `Du avslo på vegne av ${invitation.organization.name}`,
        status === InvitationStatus.ACCEPTED
          ? SnackTypes.SUCCESS
          : SnackTypes.WARNING,
      );
      reload();
      onAnswered?.();
    } catch {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    } finally {
      setBusyInvitationId(undefined);
    }
  };

  return (
    <>
      {invitations.map((invitation) => (
        <div className={styles.banner} key={invitation.id}>
          <p className={styles.eyebrow}>Invitasjon</p>
          <p className={styles.text}>
            {invitation.fromUser?.firstName ?? "Arrangøren"} vil ha{" "}
            <span className={styles.organization}>
              {invitation.organization.name}
            </span>{" "}
            som medarrangør. Godtar du, vises foreningen på arrangementet.
          </p>
          <div className={styles.actions}>
            <Button
              text="Godta"
              loading={busyInvitationId === invitation.id}
              disabled={busyInvitationId !== undefined}
              onClick={async () =>
                respond(invitation, InvitationStatus.ACCEPTED)
              }
            />
            <Button
              text="Avslå"
              type={ButtonType.SECONDARY}
              disabled={busyInvitationId !== undefined}
              onClick={async () =>
                respond(invitation, InvitationStatus.DECLINED)
              }
            />
          </div>
        </div>
      ))}
    </>
  );
}
