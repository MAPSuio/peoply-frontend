import CalendarIconSummary from "./svgs/CalendarIconSummary";

import styles from "../styles/CalendarCircleSummary.module.scss";

interface CalendarCircleSummaryProps {
  className?: string;
}

const CalendarCircleSummary = ({ className }: CalendarCircleSummaryProps) => {
  return (
    <div className={styles.container}>
      <CalendarIconSummary className={className} />
    </div>
  );
};

export default CalendarCircleSummary;
