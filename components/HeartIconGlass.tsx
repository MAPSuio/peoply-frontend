import styles from "../styles/HeartIconGlass.module.scss";

import HeartIcon from "./svgs/HeartIcon";

interface HeartIconGlassProps {
  className?: string;
  onClick: () => void;
  favorited: boolean;
}

export default function HeartIconGlass({
  className,
  onClick,
  favorited,
}: HeartIconGlassProps) {
  const heartClasses = `${className} ${
    favorited ? styles.favorited : styles.notFavorited
  }`;

  return (
    <button onClick={onClick} className={`${styles.container} ${heartClasses}`}>
      <HeartIcon />
    </button>
  );
}
