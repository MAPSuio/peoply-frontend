import type { ComponentType } from "react";

import cx from "../utils/cx";
import styles from "../styles/IconCircle.module.scss";

interface IconCircleProps {
  Icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
  tightPadding?: boolean;
  largeIcon?: boolean;
}

const IconCircle = ({
  Icon,
  iconClassName,
  tightPadding,
  largeIcon,
}: IconCircleProps) => {
  return (
    <div
      className={cx(
        styles.container,
        tightPadding && styles.tightPadding,
        largeIcon && styles.largeIcon,
      )}
    >
      <Icon className={iconClassName} />
    </div>
  );
};

export default IconCircle;
