import styles from "../styles/BackButton.module.scss";
import ChevronIcon from "./svgs/ChevronIcon";

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <div onClick={onClick} tabIndex={1} className={styles.container}>
      <ChevronIcon />
      <span>Tilbake</span>
    </div>
  );
}
