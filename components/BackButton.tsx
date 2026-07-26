import type { CSSProperties } from "react";
import styles from "../styles/BackButton.module.scss";
import ChevronIcon from "./svgs/ChevronIcon";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}

export default function BackButton({
  onClick,
  className,
  style,
}: BackButtonProps) {
  const classes = className
    ? `${styles.container} ${className}`
    : `${styles.container}`;

  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={0}
      className={classes}
      style={style}
    >
      <ChevronIcon className={styles.icon} />
      <span>Tilbake</span>
    </button>
  );
}
