import type { ComponentType } from "react";

/* Assets. */
import CheckIconRound from "./svgs/CheckIconRound";
import ErrorIcon from "./svgs/ErrorIcon";
import WarningIcon from "./svgs/WarningIcon";

/* Types. */
import { SnackTypes } from "../types/types";

/* Styles. */
import cx from "../utils/cx";
import styles from "../styles/Snackbar.module.scss";

const SNACK_TONES: Record<
  SnackTypes,
  {
    tone: string;
    shadow: string;
    Icon: ComponentType<{ className?: string }>;
    iconClassName: string;
  }
> = {
  [SnackTypes.SUCCESS]: {
    tone: styles.success,
    shadow: styles.successShadow,
    Icon: CheckIconRound,
    iconClassName: styles.successIcon,
  },
  [SnackTypes.WARNING]: {
    tone: styles.warning,
    shadow: styles.warningShadow,
    Icon: WarningIcon,
    iconClassName: styles.successIcon,
  },
  [SnackTypes.ERROR]: {
    tone: styles.error,
    shadow: styles.errorShadow,
    Icon: ErrorIcon,
    iconClassName: styles.errorIcon,
  },
};

interface SnackbarProps {
  label: string;
  type?: SnackTypes;
  first?: boolean;
}

const Snackbar = ({ label, type, first }: SnackbarProps) => {
  const tone = type === undefined ? undefined : SNACK_TONES[type];

  return (
    <div
      className={cx(
        styles.container,
        tone?.tone,
        first && (tone ? tone.shadow : styles.shadow),
        (first || !tone) && styles.animation,
      )}
    >
      <div className={styles.labelContainer}>
        {tone && <tone.Icon className={cx(styles.icon, tone.iconClassName)} />}
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
};

export default Snackbar;
