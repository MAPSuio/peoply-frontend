/* Assets. */
import SmallCheckIcon from "./svgs/SmallCheckIcon";

/* Styles. */
import styles from "../styles/ProgressCircle.module.scss";

interface ProgressCircleProps {
  success?: boolean;
  active?: boolean;
  label: string;
  step: number;
  reachedStep: number;
  changeStep: (step: number) => void;
}

const ProgressCircle = ({
  success,
  active,
  label,
  step,
  reachedStep,
  changeStep,
}: ProgressCircleProps) => {
  const getProgressCircleStyles = () => {
    if (success) {
      return `${styles.container} ${styles.success}`;
    } else if (active) {
      return `${styles.container} ${styles.active}`;
    } else {
      return `${styles.container}`;
    }
  };

  const progressCircleStyles = getProgressCircleStyles();
  return (
    <button
      disabled={reachedStep < step} // disabled when step is not reached
      className={styles.wrapper}
      onClick={() => changeStep(step)}
    >
      <div className={progressCircleStyles}>
        <SmallCheckIcon className={styles.smallCheckIcon} />
      </div>
      <p
        className={
          active ? `${styles.label} ${styles.labelActive}` : styles.label
        }
      >
        {label}
      </p>
    </button>
  );
};

export default ProgressCircle;
