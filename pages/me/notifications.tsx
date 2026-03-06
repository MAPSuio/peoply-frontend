import BackButton from "../../components/BackButton";
import HeadComponent from "../../components/HeadComponent";
import Header from "../../components/Header";
import useBack from "../../hooks/useBack";
import useUser from "../../hooks/useUser";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../services/fetchers";
import {
  ButtonType,
  EventInvitationNotification,
  InvitationStatus,
  NotificationType,
  OrganizationInvitationNotification,
  PeoplyNotification,
  SnackTypes,
  Event,
} from "../../types/types";
import styles from "../../styles/Notifications.module.scss";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button";
import useSnack from "../../hooks/useSnack";
import SleepImage from "../../assets/images/undraw_sleeping.png";
import Image from "next/legacy/image";
import useNotifications from "../../hooks/useNotifications";
import useSWR from "swr";
import Link from "next/link";
import { groupBy } from "../../utils/functions";
import Modal from "../../components/Modal";
import { useState } from "react";
import { useRouter } from "next/router";
import ModalButton from "../../components/ModalButton";
import JoinButton from "../../components/JoinButton";

export default function Notifications() {
  const { user } = useUser();
  const goBack = useBack();
  const { addSnack } = useSnack();
  const { hasUnreadNotifications, markAsRead } = useNotifications();
  const [foodPreferanceModalOpen, setFoodPreferanceModalOpenModalOpen] =
    useState(false);
  const router = useRouter();

  const {
    data: notifications,
    error: notificationError,
    mutate: mutateNotifications,
  } = useSWR<PeoplyNotification[]>(
    () =>
      user
        ? `/users/${user.id}/notifications?` // add ? to not use cache...
        : false,
    fetchFromPeoplyApiJson,
    {
      onSuccess: markAsRead, // assume notifications are read once fetched
    },
  );

  if (!user || !notifications) {
    return <></>;
  }

  if (notificationError) {
    addSnack("Kunne ikke hente varsler", SnackTypes.ERROR);
    return <></>;
  }

  const getHoursSince = (notification: PeoplyNotification) => {
    const now = new Date();
    const then = new Date(notification.createdAt);
    const diff = now.getTime() - then.getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    return hours;
  };

  const renderTimeSince = (notification: PeoplyNotification) => {
    const hours = getHoursSince(notification);
    const days = Math.floor(hours / 24);
    if (hours < 1) {
      return "under en time siden";
    } else if (hours === 1) {
      return "1 time siden";
    } else if (hours < 24) {
      return `${hours} timer siden`;
    } else if (days === 1) {
      return "1 dag siden";
    } else {
      return `${days} dager siden`;
    }
  };

  /* updates a single notification with the given action and refetches the notifications */
  async function updateInvitation(
    notification: PeoplyNotification,
    action: InvitationStatus,
  ) {
    switch (notification.type) {
      case NotificationType.INVITATION_ORGANIZATION:
        const orgInvite = notification as OrganizationInvitationNotification;
        try {
          await fetchFromPeoplyApiJson(
            `/organizations/${orgInvite.organizationId}/invitations/${orgInvite.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json; charset=utf-8" },
              body: JSON.stringify({
                status: action,
              }),
            },
          );
          if (action === InvitationStatus.ACCEPTED) {
            addSnack(
              `Du godtok invitasjonen til ${orgInvite.organization.name}`,
              SnackTypes.SUCCESS,
            );
          } else {
            addSnack(
              `Du avviste invitasjonen til ${orgInvite.organization.name}`,
              SnackTypes.WARNING,
            );
          }
        } catch (e) {
          addSnack("Noe gikk galt", SnackTypes.ERROR);
        }
        break;

      case NotificationType.INVITATION_EVENT:
        const eventInvite = notification as EventInvitationNotification;
        try {
          if (action === InvitationStatus.ACCEPTED) {
            /* fetch event to check if event serves food */
            const event: Event = await fetchFromPeoplyApiJson(
              `/events/${eventInvite.eventId}`,
            );
            if (event.hasFood && !user?.foodPreference) {
              return setFoodPreferanceModalOpenModalOpen(true);
            }
          }

          await fetchFromPeoplyApi(
            `/events/${eventInvite.eventId}/invitations`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json; charset=utf-8" },
              body: JSON.stringify({
                status: action,
              }),
            },
          );
          if (action === InvitationStatus.ACCEPTED) {
            addSnack(
              `Du godtok invitasjonen til ${eventInvite.event?.title}`,
              SnackTypes.SUCCESS,
            );
          } else {
            addSnack(
              `Du avviste invitasjonen til ${eventInvite.event?.title}`,
              SnackTypes.WARNING,
            );
          }
        } catch (e) {
          addSnack("Noe gikk galt", SnackTypes.ERROR);
        }
        break;

      default:
        return;
    }
    mutateNotifications();
  }

  /* pass event to render joinButton for eventInvitations */
  function renderNotificationActions(
    notification: PeoplyNotification,
    event?: Event,
  ) {
    switch (notification.type) {
      case NotificationType.INVITATION_ORGANIZATION:
        return (
          <div className={styles.actions}>
            <Button
              onClick={async () =>
                updateInvitation(notification, InvitationStatus.ACCEPTED)
              }
              text="Godta"
            />
            <Button
              text="Avslå"
              type={ButtonType.SECONDARY}
              onClick={async () =>
                updateInvitation(notification, InvitationStatus.DECLINED)
              }
            />
          </div>
        );
      case NotificationType.INVITATION_EVENT:
        return (
          event && (
            <div className={styles.actions}>
              <JoinButton
                joinText="Godta"
                joinedText="Du er påmeldt"
                event={event}
                updateOnChange={[
                  async () =>
                    await updateInvitation(
                      notification,
                      InvitationStatus.ACCEPTED,
                    ),
                ]}
              />
              <Button
                text="Avslå"
                type={ButtonType.SECONDARY}
                onClick={async () =>
                  updateInvitation(notification, InvitationStatus.DECLINED)
                }
              />
            </div>
          )
        );
    }
  }

  function renderEventInvitations(invitations: EventInvitationNotification[]) {
    const invitationsGroupedByEventId = groupBy<
      EventInvitationNotification,
      string
    >(invitations, ({ eventId }) => eventId);
    return invitationsGroupedByEventId.map(({ values }) => {
      const fromUsers = values.map(({ fromUser }) => (
        <Link key={fromUser?.id} href={`/users/${fromUser?.id}`}>
          {fromUser?.firstName}
        </Link>
      ));
      const invitationSortedByCreatedDate = values.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const oldestInvitation = invitationSortedByCreatedDate[0];
      const event = oldestInvitation.event;

      return (
        <div key={oldestInvitation.id} className={styles.notification}>
          {oldestInvitation.fromUser && (
            <Avatar user={oldestInvitation.fromUser} />
          )}
          <div className={styles.info}>
            <p>
              {(() => {
                if (fromUsers.length === 1) {
                  return fromUsers;
                } else if (fromUsers.length === 2) {
                  return (
                    <>
                      {fromUsers[0]} og {fromUsers[1]}
                    </>
                  );
                } else {
                  return (
                    <>
                      {fromUsers[0]}, {fromUsers[1]} og {fromUsers.length - 2}{" "}
                      andre
                    </>
                  );
                }
              })()}{" "}
              inviterer deg til å bli med på{" "}
              <Link href={`/events/${event?.urlId}`}>{event?.title}</Link>
            </p>
            <p className={styles.hoursSince}>
              {renderTimeSince(oldestInvitation)}
            </p>
            {renderNotificationActions(oldestInvitation, event)}
          </div>
        </div>
      );
    });
  }

  function renderNotifications(notifications: PeoplyNotification[]) {
    const groupedNotifications = groupBy<PeoplyNotification, NotificationType>(
      notifications,
      (notif) => notif.type,
    );

    return groupedNotifications.map(({ key: type, values }) => {
      switch (type) {
        case NotificationType.INVITATION_EVENT:
          return renderEventInvitations(
            values as EventInvitationNotification[],
          );

        case NotificationType.INVITATION_ORGANIZATION:
          return values.map((notification) => {
            const orgInvitation =
              notification as OrganizationInvitationNotification;
            const { organization } = orgInvitation;
            return (
              <div className={styles.notification} key={orgInvitation.id}>
                {user && (
                  <Avatar user={user} org={orgInvitation.organization} />
                )}
                <div className={styles.info}>
                  <p>
                    <Link href={`/org/${organization.id}`}>
                      {organization.name}
                    </Link>{" "}
                    inviterer deg til å bli medlem.
                  </p>
                  <p className={styles.hoursSince}>
                    {renderTimeSince(orgInvitation)}
                  </p>
                  {renderNotificationActions(orgInvitation)}
                </div>
              </div>
            );
          });
      }
    });
  }

  return (
    <>
      <HeadComponent title="Varsler" description="Notifications" />
      <Header />
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.header}>
          <h1>Varsler</h1>
          <p>Se og behandle dine varsler</p>
        </div>
        <div className={styles.notifications}>
          {notifications.length !== 0 && hasUnreadNotifications && (
            <Button
              text="Hent nye varsler"
              type={ButtonType.WARNING}
              onClick={() => mutateNotifications()}
            ></Button>
          )}
          {notifications?.length ? (
            renderNotifications(notifications)
          ) : (
            <>
              <div className={styles.imageContainer}>
                <Image
                  src={SleepImage}
                  alt="Bilde av sovende person"
                  placeholder="blur"
                />
              </div>
              <div className={styles.subheader}>
                <h2>Du har ingen varsler..</h2>
                <p>Kanskje det skjer noe snart?</p>
              </div>
            </>
          )}
        </div>
      </div>
      {foodPreferanceModalOpen && (
        <Modal
          label={`Arrangementet har matservering`}
          description="For å godta invitasjonen til arrangementet må du fylle ut matpreferanser på profilen din."
          closeButtonOnClick={() => setFoodPreferanceModalOpenModalOpen(false)}
        >
          <>
            <ModalButton
              text="Rediger matpreferanser"
              onClick={() => router.push("/me/edit")}
            />
            <ModalButton
              text="Lukk"
              onClick={() => setFoodPreferanceModalOpenModalOpen(false)}
              type={ButtonType.SECONDARY}
            />
          </>
        </Modal>
      )}
    </>
  );
}
