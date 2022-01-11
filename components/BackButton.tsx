import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/BackButton.module.scss";
import chevron from "../public/assets/chevron.svg";

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <div onClick={onClick} tabIndex={1} className={styles.container}>
      <Image src={chevron} objectFit="contain" alt="left-chevron" />
      <span>Tilbake</span>
    </div>
  );
}
