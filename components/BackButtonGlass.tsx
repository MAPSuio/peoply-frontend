import styles from "../styles/BackButtonGlass.module.scss";

import ChevronLeftIcon from "./svgs/ChevronLeftIcon";

interface BackButtonGlassProps {
  className?: string;
  onClick: () => void;
}

export default function BackButtonGlass({
  className,
  onClick,
}: BackButtonGlassProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.glassButton} ${className}`}
    >
      <ChevronLeftIcon />
    </button>
  );
}
