import EyeIcon from "./svgs/EyeIcon";

import styles from "../styles/EyeCircle.module.scss";

interface EyeCircleProps {
  className?: string;
}

const EyeCircle = ({ className }: EyeCircleProps) => {
  return (
    <div className={styles.container}>
      <EyeIcon className={className} />
    </div>
  );
};

export default EyeCircle;
