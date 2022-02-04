import CalendarIconCreate from "./svgs/CalendarIconCreate";

import styles from "../styles/CalendarCircle.module.scss";

interface CalendarCircleProps {
  className?: string;
}

const CalendarCircle = ({ className }: CalendarCircleProps) => {
  return (
    <div className={styles.container}>
      <CalendarIconCreate className={className} />
    </div>
  );
};

export default CalendarCircle;
