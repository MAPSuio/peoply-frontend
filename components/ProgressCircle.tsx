import SmallCheckIcon from "./svgs/SmallCheckIcon";

import useWindowDimensions from "../hooks/useWindowDimensions";

import styles from "../styles/ProgressCircle.module.scss";

interface ProgressCircleProps {
  success?: boolean;
  active?: boolean;
  label: string;
}

const ProgressCircle = ({ success, active, label }: ProgressCircleProps) => {
  const getProgressCircleStyles = () => {
    if (success) {
      return `${styles.container} ${styles.success}`;
    } else if (active) {
      return `${styles.container} ${styles.active}`;
    } else {
      return `${styles.container}`;
    }
  };

  const { width: windowWidth } = useWindowDimensions();
  const progressCircleStyles = getProgressCircleStyles();

  return (
    <div className={styles.wrapper}>
      <div className={progressCircleStyles}>
        <SmallCheckIcon
          width={windowWidth < 600 ? 8 : 14}
          height={windowWidth < 600 ? 8 : 14}
        />
      </div>
      <p
        className={
          active ? `${styles.label} ${styles.labelActive}` : styles.label
        }
      >
        {label}
      </p>
    </div>
  );
};

export default ProgressCircle;
