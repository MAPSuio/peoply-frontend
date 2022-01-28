import styles from "../styles/ProgressConnector.module.scss";

interface ProgressConnectorProps {
  nextSuccess?: boolean;
  success?: boolean;
}

const ProgressConnector = ({
  nextSuccess,
  success,
}: ProgressConnectorProps) => {
  const getProgressConnectorStyles = () => {
    if (success && !nextSuccess) {
      return `${styles.progressConnector} ${styles.active}`;
    } else if (success) {
      return `${styles.progressConnector} ${styles.success}`;
    } else {
      return `${styles.progressConnector}`;
    }
  };

  const progressConnectorStyles = getProgressConnectorStyles();

  return <div className={progressConnectorStyles} />;
};

export default ProgressConnector;
