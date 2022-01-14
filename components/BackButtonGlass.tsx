import styles from "../styles/BackButtonGlass.module.scss";

import ChevronLeftIcon from "./svgs/ChevronLeftIcon";

interface BackButtonGlassProps {
  classes?: string;
  onClick: () => void;
}

export default function BackButtonGlass({
  classes,
  onClick,
}: BackButtonGlassProps) {
  return (
    <button onClick={onClick} className={`${styles.glassButton} ${classes}`}>
      <ChevronLeftIcon />
    </button>
  );
}
