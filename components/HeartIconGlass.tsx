import { useState } from "react";
import styles from "../styles/HeartIconGlass.module.scss";

import HeartIcon from "./svgs/HeartIcon";

interface HeartIconGlassProps {
  className?: string;
  onClick: (() => void) | (() => Promise<void>);
  favorited: boolean;
  loading?: boolean;
}

export default function HeartIconGlass({
  className,
  onClick,
  favorited,
  loading,
}: HeartIconGlassProps) {
  const [loadingState, setLoadingState] = useState(false);
  const heartClasses = `${className} ${
    favorited ? styles.favorited : styles.notFavorited
  }`;

  return (
    <button
      onClick={async () => {
        setLoadingState(true);
        await onClick();
        setLoadingState(false);
      }}
      disabled={loading || loadingState}
      className={`${styles.container} ${heartClasses}`}
    >
      <HeartIcon />
    </button>
  );
}
