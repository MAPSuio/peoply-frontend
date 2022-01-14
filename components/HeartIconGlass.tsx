import { useState } from "react";
import styles from "../styles/HeartIconGlass.module.scss";

import HeartIcon from "./svgs/HeartIcon";

interface HeartIconGlassProps {
  classes?: string;
  onClick: () => void;
  favorited: boolean;
}

export default function HeartIconGlass({
  classes,
  onClick,
  favorited,
}: HeartIconGlassProps) {
  const heartClasses = `${classes} ${
    favorited ? styles.favorited : styles.notFavorited
  }`;

  return (
    <button onClick={onClick} className={`${styles.container} ${heartClasses}`}>
      <HeartIcon />
    </button>
  );
}
