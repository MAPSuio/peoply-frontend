import styles from "../styles/CheckCircle.module.scss";

import CheckIcon from "./icons/CheckIcon";

export default function CheckCircle() {
  return (
    <div className={styles.container}>
      <div className={styles.checkContainer}>
        <CheckIcon />
      </div>
    </div>
  );
}
