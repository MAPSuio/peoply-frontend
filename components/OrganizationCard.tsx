// Next.js.
import useSWR from "swr";

// Components.
import Avatar from "./Avatar";
import UserIconCard from "./svgs/UserIconCard";
import SmallCheckCircle from "./SmallCheckCircle";
import CalendarIconCard from "./svgs/CalendarIconCard";

// Hooks.
import useOrganization from "../hooks/useOrganization";
import { eventWindowBoundary } from "../utils/eventWindow";

// Services.
import { fetchFromPeoplyApiJson } from "../services/fetchers";

// Styles.
import styles from "../styles/OrganizationCard.module.scss";

interface OrganizationCardProps {
  organizationID: string;
}

const OrganizationCard = ({ organizationID }: OrganizationCardProps) => {
  const {
    organization: org,
    organizationUsers: orgUsers,
    loading,
    error,
  } = useOrganization(organizationID, { fetchMembers: false });

  const { data: orgEvents } = useSWR<Event[]>(
    () =>
      org?.id
        ? `/events?afterDate=${eventWindowBoundary()}&organizationId=${org?.id}`
        : false,
    fetchFromPeoplyApiJson,
    {
      fallbackData: [],
    },
  );

  if (loading) {
    return <></>; // TODO: Add loading skeleton card here.
  }

  if (error) {
    return <></>; // TODO: Add error card here.
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <Avatar org={org} size="large" />
      </div>
      <div className={styles.infoContainer}>
        <div className={styles.nameContainer}>
          <h2>{org?.name}</h2>
          {org?.orgNr && <SmallCheckCircle purple verySmall />}
        </div>
        <div className={styles.dataContainer}>
          <div className={styles.iconContainer}>
            <UserIconCard className={styles.icon} />
            <p className={styles.data}>{orgUsers?.length}</p>
            <p className={styles.dataDescription}>Medlemmer</p>
          </div>
          <div className={styles.iconContainer}>
            <CalendarIconCard className={styles.icon} />
            <p className={styles.data}>{orgEvents?.length}</p>
            <p className={styles.dataDescription}>Arrangementer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
