import type { ComponentType } from "react";

import styles from "../styles/IconCircle.module.scss";

interface IconCircleProps {
  Icon: ComponentType<{ className?: string }>;
  iconClassName?: string;
}

const IconCircle = ({ Icon, iconClassName }: IconCircleProps) => {
  return (
    <div className={styles.container}>
      <Icon className={iconClassName} />
    </div>
  );
};

export default IconCircle;
