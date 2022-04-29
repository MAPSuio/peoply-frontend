// Styles.
import styles from "../styles/LoadingWheel.module.scss";

interface LoadingWheelProps {
  dark?: boolean;
}

export default function LoadingWheel({ dark }: LoadingWheelProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.loader} ${dark && styles.dark}`}></div>
    </div>
  );
}
