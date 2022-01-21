import styles from "../styles/SmallCheckCircle.module.scss";

import SmallCheckIcon from "./svgs/SmallCheckIcon";

interface SmallCheckCircleProps {
  placeBottomCenter?: boolean;
}

export default function SmallCheckCircle({
  placeBottomCenter,
}: SmallCheckCircleProps) {
  const getCheckCircleStyles = () => {
    if (placeBottomCenter) {
      return `${styles.container} ${styles.placeBottomCenter}`;
    } else {
      return styles.container;
    }
  };

  const checkCircleStyles = getCheckCircleStyles();

  return (
    <div className={checkCircleStyles}>
      <SmallCheckIcon />
    </div>
  );
}
