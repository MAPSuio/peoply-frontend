import styles from "../styles/SmallCheckCircle.module.scss";

import cx from "../utils/cx";
import SmallCheckIcon from "./svgs/SmallCheckIcon";

interface SmallCheckCircleProps {
  placeBottomCenter?: boolean;
  placeRight?: boolean;
  purple?: boolean;
  small?: boolean;
  verySmall?: boolean;
  ultraSmall?: boolean;
  className?: string;
}

export default function SmallCheckCircle({
  placeBottomCenter,
  purple,
  placeRight,
  small,
  verySmall,
  ultraSmall,
  className,
}: SmallCheckCircleProps) {
  /* A span rather than a div: the badge is used inside <p> elements (event
     page, cards), where a div is invalid HTML and breaks hydration. Layout
     is unaffected - display comes from the container class. */
  return (
    <span
      className={cx(
        styles.container,
        placeBottomCenter && styles.placeBottomCenter,
        purple && styles.purple,
        placeRight && styles.placeRight,
      )}
    >
      <SmallCheckIcon
        className={cx(
          small && styles.small,
          verySmall && styles.verySmall,
          ultraSmall && styles.ultraSmall,
          className,
        )}
        strokeWidth={ultraSmall ? "3" : undefined}
      />
    </span>
  );
}
