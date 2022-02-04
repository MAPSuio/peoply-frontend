import NumberIcon from "./svgs/NumberIcon";

import styles from "../styles/NumberCircle.module.scss";

interface NumberCircleProps {
  className?: string;
}

const NumberCircle = ({ className }: NumberCircleProps) => {
  return (
    <div className={styles.container}>
      <NumberIcon className={className} />
    </div>
  );
};

export default NumberCircle;
