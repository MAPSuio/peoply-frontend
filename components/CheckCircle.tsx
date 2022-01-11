import styles from "../styles/CheckCircle.module.scss";
import check from "../public/assets/check.svg";
import Image from "next/image";

export default function CheckCircle() {
  return (
    <div className={styles.container}>
      <div className={styles.checkContainer}>
        <Image
          className={styles.check}
          src={check}
          objectFit="contain"
          alt="check-circle"
        />
      </div>
    </div>
  );
}
