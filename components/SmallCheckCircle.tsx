import styles from "../styles/SmallCheckCircle.module.scss";

import SmallCheckIcon from "./icons/SmallCheckIcon";

export default function SmallCheckCircle() {
  return (
    <div className={styles.container}>
      <SmallCheckIcon />
    </div>
  );
}
