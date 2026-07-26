import { type MouseEvent, useState } from "react";
import styles from "../styles/HeartIconGlass.module.scss";

import HeartIcon from "./svgs/HeartIcon";

interface HeartIconGlassProps {
  className?: string;
  onClick: ((e: MouseEvent<HTMLButtonElement>) => void) | (() => Promise<void>);
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
      type="button"
      onClick={async (e) => {
        setLoadingState(true);
        await onClick(e);
        setLoadingState(false);
      }}
      disabled={loading || loadingState}
      className={`${styles.container} ${heartClasses}`}
    >
      <HeartIcon />
    </button>
  );
}
