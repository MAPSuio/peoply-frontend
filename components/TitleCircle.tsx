import styles from "../styles/TitleCircle.module.scss";

import TitleIcon from "./svgs/TitleIcon";

interface TitleCircleProps {
  className?: string;
}

const TitleCircle = ({ className }: TitleCircleProps) => {
  return (
    <div className={styles.container}>
      <TitleIcon className={className} />
    </div>
  );
};

export default TitleCircle;
