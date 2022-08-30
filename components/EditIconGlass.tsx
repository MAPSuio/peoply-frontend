import { useState } from "react";
import styles from "../styles/EditIconGlass.module.scss";

import EditIcon from "./svgs/EditIcon";

interface EditIconGlassProps {
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function EditIconGlass({
  className,
  loading,
  onClick,
  disabled,
}: EditIconGlassProps) {
  const [loadingState, setLoadingState] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading || loadingState || disabled}
      className={`${styles.container} ${className}`}
    >
      <EditIcon />
    </button>
  );
}
