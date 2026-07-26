/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import DataIconSummary from "../svgs/DataIconSummary";
import VisibilityIndicator from "./VisibilityIndicator";

/* Icons */
import NoLimitIconSmall from "../svgs/NoLimitIconSmall";
import LimitIconSmall from "../svgs/LimitIconSmall";
import LinkIcon from "../svgs/LinkIcon";
import FoodIcon from "../svgs/FoodIcon";
import NoFoodIcon from "../svgs/NoFoodIcon";
import HelpCircleIcon from "../svgs/HelpCircleIcon";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";
import { EventObjectProps } from "../../pages/events/create";

interface DataSummarySectionProps {
  eventObject: EventObjectProps;
  onClick: (inputId: number) => void;
}

/* Read-only data/visibility card used by SummaryPage (event creation). */
const DataSummarySection = ({
  eventObject,
  onClick,
}: DataSummarySectionProps) => {
  return (
    <SummaryCard
      inputId={5}
      Icon={
        <IconCircle Icon={DataIconSummary} iconClassName={styles.summaryIcon} />
      }
      onClick={onClick}
    >
      <div className={styles.dataContainer}>
        <VisibilityIndicator visibility={eventObject.eventVisibility} />
        {eventObject.eventHasCapacity ? (
          <div className={styles.dataItemContainer}>
            <LimitIconSmall className={styles.dataIcon} />
            <p
              className={styles.dataLabel}
            >{`${eventObject.eventCapacity} plasser`}</p>
          </div>
        ) : (
          <div className={styles.dataItemContainer}>
            <NoLimitIconSmall className={styles.dataIcon} />
            <p className={styles.dataLabel}>Ingen kapasitet</p>
          </div>
        )}
        {eventObject.eventHasFood ? (
          <div className={styles.dataItemContainer}>
            <FoodIcon className={styles.dataIcon} />
            <p className={styles.dataLabel}>Det serveres mat</p>
          </div>
        ) : (
          <div className={styles.dataItemContainer}>
            <NoFoodIcon className={styles.dataIcon} />
            <p className={styles.dataLabel}>Ingen matservering</p>
          </div>
        )}
        {eventObject.eventFormQuestion && (
          <div className={styles.dataItemContainer}>
            <HelpCircleIcon className={styles.dataIcon} />
            <p className={styles.dataLabel}>
              {eventObject.eventFormQuestion.length > 30
                ? eventObject.eventFormQuestion.slice(0, 29) + "...?"
                : eventObject.eventFormQuestion}
            </p>
          </div>
        )}
        {eventObject.eventHasExternalRegistration && (
          <div className={styles.dataItemContainer}>
            <LinkIcon className={styles.dataIcon} />
            <p
              className={styles.dataLabel}
              style={{ overflowWrap: "anywhere" }}
            >
              Ekstern påmelding: {eventObject.eventExternalUrl}
            </p>
          </div>
        )}
      </div>
    </SummaryCard>
  );
};

export default DataSummarySection;
