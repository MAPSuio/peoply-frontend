import styles from "../styles/HeartIconGlass.module.scss";

import HeartIcon from "./icons/HeartIcon";

interface HeartIconGlassProps {
  classes?: string;
}

export default function HeartIconGlass({ classes }: HeartIconGlassProps) {
  return (
    <div className={`${styles.container} ${classes}`}>
      <HeartIcon />
    </div>
  );
}
