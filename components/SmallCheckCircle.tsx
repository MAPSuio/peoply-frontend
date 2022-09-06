import styles from "../styles/SmallCheckCircle.module.scss";

import SmallCheckIcon from "./svgs/SmallCheckIcon";

interface SmallCheckCircleProps {
  placeBottomCenter?: boolean;
  placeRight?: boolean;
  purple?: boolean;
  small?: boolean;
  verySmall?: boolean;
}

export default function SmallCheckCircle({
  placeBottomCenter,
  purple,
  placeRight,
  small,
  verySmall,
}: SmallCheckCircleProps) {
  const getCheckCircleStyles = () => {
    return `${styles.container} ${
      placeBottomCenter && styles.placeBottomCenter
    }  ${purple && styles.purple} ${placeRight && styles.placeRight}`;
  };

  const checkCircleStyles = getCheckCircleStyles();

  return (
    <div className={checkCircleStyles}>
      <SmallCheckIcon
        className={`${small && styles.small} ${verySmall && styles.verySmall}`}
      />
    </div>
  );
}
