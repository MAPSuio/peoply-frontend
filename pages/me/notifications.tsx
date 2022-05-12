import BackButton from "../../components/BackButton";
import HeadComponent from "../../components/HeadComponent";
import Header from "../../components/Header";
import useBack from "../../hooks/useBack";
import useUser from "../../hooks/useUser";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import {
  ButtonType,
  InvitationStatus,
  NotificationType,
  OrganizationInvitation,
  PeoplyNotification,
  SnackTypes,
} from "../../types/types";
import styles from "../../styles/Notifications.module.scss";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button";
import useSnack from "../../hooks/useSnack";
import SleepImage from "../../assets/images/undraw_sleeping.png";
import Image from "next/image";
import useNotifications from "../../hooks/useNotifications";
import useSWR from "swr";

export default function Notifications() {
  const { user } = useUser();
  const goBack = useBack();
  const { addSnack } = useSnack();
  const { hasUnreadNotifications, markAsRead } = useNotifications();

  const {
    data: notifications,
    error: notificationError,
    mutate: mutateNotifications,
  } = useSWR<PeoplyNotification[]>(
    () =>
      user && !notifications?.length
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

  /* updates a single notification with the given action and refetches the notifications */
  const updateInvitation = async (
    notification: PeoplyNotification,
    action: InvitationStatus,
  ) => {
    switch (notification.type) {
      case NotificationType.INVITATION_ORGANIZATION:
        const orgInvite = notification as PeoplyNotification &
          OrganizationInvitation;
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
            addSnack("Du godtok invitasjonen", SnackTypes.SUCCESS);
          } else {
            addSnack("Du avviste invitasjonen", SnackTypes.WARNING);
          }
        } catch (e) {
          addSnack("Noe gikk galt", SnackTypes.ERROR);
        }
        break;

      default:
        return;
    }
    mutateNotifications();
  };

  return (
    <>
      <HeadComponent title="Peoply - Varsler" description="Notifications" />
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
              text="Hent nye varlser"
              type={ButtonType.WARNING}
              onClick={() => mutateNotifications()}
            ></Button>
          )}
          {notifications?.length ? (
            notifications.map((notification) => {
              const hoursSince = getHoursSince(notification);
              switch (notification.type) {
                case NotificationType.INVITATION_ORGANIZATION:
                  const orgInvitation = notification as OrganizationInvitation &
                    PeoplyNotification;
                  const { organization } = orgInvitation;
                  return (
                    <div
                      className={`${styles.orgInvitation} ${styles.notification}`}
                    >
                      <Avatar user={user} org={orgInvitation.organization} />
                      <div className={styles.info}>
                        <p>
                          <b>{organization.name}</b> inviterer deg til å bli
                          medlem.
                        </p>
                        <p className={styles.hoursSince}>
                          {hoursSince < 1
                            ? "under 1 time"
                            : `${hoursSince} time(r) siden`}{" "}
                          siden
                        </p>
                        <div className={styles.actions}>
                          <Button
                            onClick={async () =>
                              updateInvitation(
                                notification,
                                InvitationStatus.ACCEPTED,
                              )
                            }
                            text="Godta"
                          />
                          <Button
                            text="Avslå"
                            type={ButtonType.SECONDARY}
                            onClick={async () =>
                              updateInvitation(
                                notification,
                                InvitationStatus.DECLINED,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );

                default:
                  return <h1>def</h1>;
              }
            })
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
    </>
  );
}
