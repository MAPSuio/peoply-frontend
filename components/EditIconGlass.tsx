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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={`${styles.container} ${className}`}
    >
      <EditIcon />
    </button>
  );
}
