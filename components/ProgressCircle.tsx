import SmallCheckIcon from "./svgs/SmallCheckIcon";

import styles from "../styles/ProgressCircle.module.scss";

interface ProgressCircleProps {
  success?: boolean;
  active?: boolean;
}

const ProgressCircle = ({ success, active }: ProgressCircleProps) => {
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
    <div className={progressCircleStyles}>
      <SmallCheckIcon width={8} height={8} />
    </div>
  );
};

export default ProgressCircle;
