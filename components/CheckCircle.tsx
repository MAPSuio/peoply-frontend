import styles from "../styles/CheckCircle.module.scss";

import CheckIcon from "./svgs/CheckIcon";

interface CheckCircleProps {
  className?: string;
}

export default function CheckCircle({ className }: CheckCircleProps) {
  return (
    <div className={styles.container}>
      <div className={styles.checkContainer}>
        <CheckIcon className={className} />
      </div>
    </div>
  );
}
