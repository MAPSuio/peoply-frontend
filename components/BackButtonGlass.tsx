import styles from "../styles/BackButtonGlass.module.scss";

import ChevronLeftIcon from "./svgs/ChevronLeftIcon";

interface BackButtonGlassProps {
  classes?: string;
}

export default function BackButtonGlass({ classes }: BackButtonGlassProps) {
  return (
    <div className={`${styles.container} ${classes}`}>
      <ChevronLeftIcon />
    </div>
  );
}
