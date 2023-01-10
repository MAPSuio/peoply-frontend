import DateIcon from "./svgs/DateIcon";

import styles from "../styles/DateCircle.module.scss";

interface DateCircleProps {
  className?: string;
}

export default function DateCircle({ className }: DateCircleProps) {
  return (
    <div className={styles.container}>
      <DateIcon className={className} />
    </div>
  );
}
