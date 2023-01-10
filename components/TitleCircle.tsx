import TitleIcon from "./svgs/TitleIcon";

import styles from "../styles/TitleCircle.module.scss";

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
