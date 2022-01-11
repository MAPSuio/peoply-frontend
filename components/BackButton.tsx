import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/BackButton.module.scss";
import chevron from "../public/assets/chevron.png";

export default function BackButton() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.back()}
      tabIndex={1}
      className={styles.container}
    >
      <Image src={chevron} objectFit="contain" alt="left-chevron" />
      <span>Tilbake</span>
    </div>
  );
}
