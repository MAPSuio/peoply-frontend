import styles from "../styles/ProgressConnector.module.scss";

interface ProgressConnectorProps {
  nextActive?: boolean;
  success?: boolean;
}

const ProgressConnector = ({ nextActive, success }: ProgressConnectorProps) => {
  const getProgressConnectorStyles = () => {
    if (nextActive) {
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
