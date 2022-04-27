import styles from "../styles/LoadingWheel.module.scss";

export default function LoadingWheel() {
  return (
    <div className={styles.container}>
      <div className={styles.loader}></div>
    </div>
  );
}
