// Next.js.
import Link from "./Link";
import Image from "next/image";

// Components.
import ArrangerAvatar from "./ArrangerAvatar";
import EventActions from "./EventActions";
import HeartIconGlass from "./HeartIconGlass";
import RegistrationCount from "./RegistrationCount";

// Hooks.
import useEventFavorite from "../hooks/useEventFavorite";
import useRegistrationCount from "../hooks/useRegistrationCount";

// Utils.
import cx from "../utils/cx";
import { formatDateRange, formatTimeRange } from "../utils/functions";
import { getCompactEventArrangerLabel } from "../utils/eventArrangers";
import { getEventImage, isEventFinished } from "../utils/event";

// Types.
import type { Event } from "../types/types";

// Assets.
import placeholderImage from "../assets/images/undraw_partying.png";
import UsersIcon from "./svgs/UsersIcon";
import TimeIcon from "./svgs/TimeIcon";
import PlaceIcon from "./svgs/PlaceIcon";
import UserIconCard from "./svgs/UserIconCard";

// Styles.
import styles from "../styles/LargeEventCard.module.scss";

interface LargeEventCardProps {
  event: Event;
  showArranger?: boolean;
  stackActionsOnDesktop?: boolean;
  compact?: boolean;
  className?: string;
}

interface DataRowProps {
  Icon: (props: { className?: string }) => React.ReactNode;
  compact: boolean;
  /* With the arranger shown, every row's icon sits in a circle so the rows
     line up with the arranger avatar. Without it the icons render bare. */
  circledIcon: boolean;
  children: React.ReactNode;
}

const DataRow = ({ Icon, compact, circledIcon, children }: DataRowProps) => (
  <div className={styles.dataItemContainer}>
    {circledIcon ? (
      <div
        className={cx(
          styles.iconContainer,
          compact && styles.compactIconContainer,
        )}
      >
        <Icon className={cx(styles.icon, compact && styles.compactIcon)} />
      </div>
    ) : (
      <Icon
        className={cx(
          styles.icon,
          compact && styles.compactIcon,
          styles.marginRightVerySmall,
        )}
      />
    )}
    <p className={cx(styles.data, compact && styles.compactData)}>{children}</p>
  </div>
);

const CardMedia = ({ event, compact }: { event: Event; compact: boolean }) => {
  const {
    favorited,
    loading: favoriteLoading,
    toggleFavorite,
  } = useEventFavorite(event.id);

  return (
    <div
      className={cx(
        styles.imageContainer,
        compact && styles.compactImageContainer,
      )}
    >
      <Image
        src={getEventImage(event) ?? placeholderImage}
        alt="A very cute cat"
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority={true}
      />
      <HeartIconGlass
        className={styles.favoriteIcon}
        onClick={toggleFavorite}
        favorited={favorited}
        loading={favoriteLoading}
      />
    </div>
  );
};

const CardTitle = ({
  event,
  compact,
  count,
}: {
  event: Event;
  compact: boolean;
  count: number | undefined;
}) => (
  <div
    className={cx(
      styles.titleContainer,
      compact && styles.compactTitleContainer,
    )}
  >
    <h3 className={cx(styles.title, compact && styles.compactTitle)}>
      {event.title}
    </h3>
    <RegistrationCount event={event}>
      <div
        className={cx(
          styles.capacityContainer,
          compact && styles.compactCapacityContainer,
        )}
      >
        <UsersIcon
          className={cx(
            styles.icon,
            compact && styles.compactIcon,
            styles.marginRightVerySmall,
          )}
        />
        <p className={cx(styles.data, compact && styles.compactData)}>
          <span className={styles.emphasis}>{count}</span>
          {event.capacity && `\u200A/\u200A${event.capacity}`}
        </p>
      </div>
    </RegistrationCount>
  </div>
);

const ArrangerRow = ({
  event,
  compact,
}: {
  event: Event;
  compact: boolean;
}) => (
  <div className={styles.dataItemContainer}>
    <ArrangerAvatar
      event={event}
      classNames={{
        image: styles.arrangerImage,
        iconContainer: styles.iconContainer,
        icon: styles.icon,
      }}
      fallbackIcon={<UserIconCard className={styles.icon} />}
    />
    <div>
      <span className={cx(styles.data, compact && styles.compactData)}>
        {getCompactEventArrangerLabel(event, 2)}
      </span>
    </div>
  </div>
);

const CardDetails = ({
  event,
  compact,
  showArranger,
  dateString,
  timeString,
}: {
  event: Event;
  compact: boolean;
  showArranger: boolean;
  dateString: string;
  timeString: string;
}) => (
  <div
    className={cx(styles.dataContainer, compact && styles.compactDataContainer)}
  >
    {showArranger && <ArrangerRow event={event} compact={compact} />}
    <DataRow Icon={TimeIcon} compact={compact} circledIcon={showArranger}>
      {dateString}, {timeString}
    </DataRow>
    <DataRow Icon={PlaceIcon} compact={compact} circledIcon={showArranger}>
      {event.locationName}
    </DataRow>
  </div>
);

/* A finished event has nothing left to act on, so the whole row goes. */
const CardActions = ({
  event,
  compact,
  stackActionsOnDesktop,
  updateRegistrations,
}: {
  event: Event;
  compact: boolean;
  stackActionsOnDesktop: boolean;
  updateRegistrations: () => void;
}) => {
  if (isEventFinished(event)) {
    return null;
  }

  return (
    <div
      className={cx(
        styles.actionContainer,
        compact && styles.compactActionContainer,
        stackActionsOnDesktop && styles.stackedActions,
      )}
    >
      <div
        className={cx(
          styles.primaryActions,
          compact && styles.compactPrimaryActions,
          stackActionsOnDesktop && styles.stackedPrimaryActions,
        )}
      >
        <EventActions
          event={event}
          updateOnChange={[updateRegistrations]}
          useUnregisterModal
          calendarButtonText={compact ? "Kalender" : undefined}
          joinButtonClassName={cx(
            styles.primaryActionButton,
            compact && styles.compactActionButton,
          )}
          calendarButtonClassName={cx(
            styles.secondaryActionButton,
            compact && styles.compactActionButton,
          )}
        />
      </div>
    </div>
  );
};

const LargeEventCard = ({
  event,
  showArranger,
  stackActionsOnDesktop = false,
  compact = false,
  className,
}: LargeEventCardProps) => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateString = formatDateRange(startDate, endDate).slice(0, -5);
  const timeString = formatTimeRange(startDate, endDate);

  const { data: registrations, mutate: updateRegistrations } =
    useRegistrationCount(event);

  return (
    <Link
      href={{
        pathname: "/events/[eventId]",
        query: { eventId: event.urlId },
      }}
      className={cx(
        styles.cardWrapper,
        compact && styles.compactCardWrapper,
        className,
      )}
    >
      <div className={styles.cardContainer}>
        <CardMedia event={event} compact={compact} />
        <div
          className={cx(
            styles.contentContainer,
            compact && styles.compactContentContainer,
          )}
        >
          <CardTitle event={event} compact={compact} count={registrations} />
          <span className={styles.divider} />
          <CardDetails
            event={event}
            compact={compact}
            showArranger={!!showArranger}
            dateString={dateString}
            timeString={timeString}
          />
          <CardActions
            event={event}
            compact={compact}
            stackActionsOnDesktop={stackActionsOnDesktop}
            updateRegistrations={updateRegistrations}
          />
        </div>
      </div>
    </Link>
  );
};

export default LargeEventCard;
