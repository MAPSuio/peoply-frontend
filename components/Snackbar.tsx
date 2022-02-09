/* Assets. */
import CheckIconRound from "./svgs/CheckIconRound";
import ErrorIcon from "./svgs/ErrorIcon";
import WarningIcon from "./svgs/WarningIcon";

/* Styles. */
import styles from "../styles/Snackbar.module.scss";
import { SnackTypes } from "../types/types";

interface SnackbarProps {
  label: string;
  type?: SnackTypes;
  first?: boolean;
}

const Snackbar = ({ label, type, first }: SnackbarProps) => {
  const getIcon = () => {
    switch (type) {
      case SnackTypes.Success:
        return (
          <CheckIconRound className={`${styles.icon} ${styles.successIcon}`} />
        );
      case SnackTypes.Warning:
        return (
          <WarningIcon className={`${styles.icon} ${styles.successIcon}`} />
        );
      case SnackTypes.Error:
        return <ErrorIcon className={`${styles.icon} ${styles.errorIcon}`} />;
    }
  };

  const getSnackStyles = () => {
    if (type === SnackTypes.Success && first) {
      return `${styles.container} ${styles.success} ${styles.successShadow} ${styles.animation}`;
    } else if (type === SnackTypes.Success) {
      return `${styles.container} ${styles.success}`;
    } else if (type === SnackTypes.Warning && first) {
      return `${styles.container} ${styles.warning} ${styles.warningShadow} ${styles.animation}`;
    } else if (type === SnackTypes.Warning) {
      return `${styles.container} ${styles.warning}`;
    } else if (type === SnackTypes.Error && first) {
      return `${styles.container} ${styles.error} ${styles.errorShadow} ${styles.animation}`;
    } else if (type === SnackTypes.Error) {
      return `${styles.container} ${styles.error}`;
    } else {
      return `${styles.container}`;
    }
  };

  const icon = getIcon();
  const snackStyles = getSnackStyles();

  return (
    <div className={snackStyles}>
      <div className={styles.labelContainer}>
        {icon}
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
};

export default Snackbar;
