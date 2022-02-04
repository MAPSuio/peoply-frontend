import InfoIcon from "./svgs/InfoIcon";

import styles from "../styles/InfoCircle.module.scss";

interface InfoCircleProps {
  className?: string;
}

const InfoCircle = ({ className }: InfoCircleProps) => {
  return (
    <div className={styles.container}>
      <InfoIcon className={className} />
    </div>
  );
};

export default InfoCircle;
