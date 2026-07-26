/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import CalendarIconSummary from "../svgs/CalendarIconSummary";

/* Utils */
import { getDateString } from "../../utils/functions";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";
import type { EventObjectProps } from "../../pages/events/create";

interface DateTimeSummarySectionProps {
  eventObject: EventObjectProps;
  onClick: (inputId: number) => void;
}

/* Read-only date/time card used by SummaryPage (event creation). */
const DateTimeSummarySection = ({
  eventObject,
  onClick,
}: DateTimeSummarySectionProps) => {
  /* Format dates for displaying in summary card. */
  const dateStringStart = getDateString(eventObject.eventDateStart);
  const dateStringEnd =
    eventObject.eventHasDateEnd && eventObject.eventDateEnd
      ? getDateString(eventObject.eventDateEnd)
      : "";

  return (
    <SummaryCard
      inputId={1}
      Icon={
        <IconCircle
          Icon={CalendarIconSummary}
          iconClassName={styles.summaryIcon}
        />
      }
      onClick={onClick}
    >
      <p
        className={`${styles.dateText} ${
          eventObject.eventHasDateEnd && styles.marginBottomVerySmall
        }`}
      >
        <span className={styles.textColorPrimary}>Start: </span>
        {`${dateStringStart}, ${eventObject.eventTimeStart}`}
      </p>
      {eventObject.eventHasDateEnd && (
        <p
          className={`${styles.dateText} ${
            eventObject.eventHasRegStart && styles.marginBottomVerySmall
          }`}
        >
          <span className={styles.textColorPrimary}>Slutt: </span>
          {`${dateStringEnd}, ${eventObject.eventTimeEnd}`}
        </p>
      )}
      {eventObject.eventHasRegStart && (
        <p
          className={`${styles.dateText} ${
            eventObject.eventHasRegEnd && styles.marginBottomVerySmall
          }`}
        >
          <span className={styles.textColorPrimary}>Påmelding åpner: </span>
          {`${getDateString(eventObject.eventRegStartDate)}, ${
            eventObject.eventRegStartTime
          }`}
        </p>
      )}
      {eventObject.eventHasRegEnd && (
        <p className={`${styles.dateText} ${styles.marginBottomVerySmall}`}>
          <span className={styles.textColorPrimary}>Påmelding stenger: </span>
          {`${getDateString(eventObject.eventRegEndDate)}, ${
            eventObject.eventRegEndTime
          }`}
        </p>
      )}
    </SummaryCard>
  );
};

export default DateTimeSummarySection;
