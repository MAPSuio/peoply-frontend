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
      case SnackTypes.SUCCESS:
        return (
          <CheckIconRound className={`${styles.icon} ${styles.successIcon}`} />
        );
      case SnackTypes.WARNING:
        return (
          <WarningIcon className={`${styles.icon} ${styles.successIcon}`} />
        );
      case SnackTypes.ERROR:
        return <ErrorIcon className={`${styles.icon} ${styles.errorIcon}`} />;
    }
  };

  const getSnackStyles = () => {
    if (type === SnackTypes.SUCCESS && first) {
      return `${styles.container} ${styles.success} ${styles.successShadow} ${styles.animation}`;
    } else if (type === SnackTypes.SUCCESS) {
      return `${styles.container} ${styles.success}`;
    } else if (type === SnackTypes.WARNING && first) {
      return `${styles.container} ${styles.warning} ${styles.warningShadow} ${styles.animation}`;
    } else if (type === SnackTypes.WARNING) {
      return `${styles.container} ${styles.warning}`;
    } else if (type === SnackTypes.ERROR && first) {
      return `${styles.container} ${styles.error} ${styles.errorShadow} ${styles.animation}`;
    } else if (type === SnackTypes.ERROR) {
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
