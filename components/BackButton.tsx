import styles from "../styles/BackButton.module.scss";
import ChevronIcon from "./svgs/ChevronIcon";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export default function BackButton({ onClick, className }: BackButtonProps) {
  const classes = className
    ? `${styles.container} ${className}`
    : `${styles.container}`;

  return (
    <button onClick={onClick} tabIndex={1} className={classes}>
      <ChevronIcon />
      <span>Tilbake</span>
    </button>
  );
}
