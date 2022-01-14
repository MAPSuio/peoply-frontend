import styles from "../styles/CheckCircle.module.scss";

import CheckIcon from "./svgs/CheckIcon";

export default function CheckCircle() {
  return (
    <div className={styles.container}>
      <div className={styles.checkContainer}>
        <CheckIcon />
      </div>
    </div>
  );
}
