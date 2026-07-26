/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import PlaceIconSummary from "../svgs/PlaceIconSummary";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";
import { EventObjectProps } from "../../pages/events/create";

interface PlaceSummarySectionProps {
  eventObject: EventObjectProps;
  onClick: (inputId: number) => void;
}

/* Read-only place card used by SummaryPage (event creation). */
const PlaceSummarySection = ({
  eventObject,
  onClick,
}: PlaceSummarySectionProps) => {
  return (
    <SummaryCard
      inputId={2}
      Icon={
        <IconCircle
          Icon={PlaceIconSummary}
          iconClassName={styles.summaryIcon}
        />
      }
      onClick={onClick}
    >
      <p className={`${styles.placeText} ${styles.marginBottomSmall}`}>
        {eventObject.eventLocationName}
      </p>
      {eventObject.eventLocation?.poi?.name && (
        <span className={`${styles.placeText} ${styles.address}`}>
          {eventObject.eventLocation?.poi?.name}
        </span>
      )}
      {eventObject.eventLocation?.address?.freeformAddress && (
        <span className={`${styles.placeText} ${styles.address}`}>
          {eventObject.eventLocation?.address?.freeformAddress}
        </span>
      )}
    </SummaryCard>
  );
};

export default PlaceSummarySection;
