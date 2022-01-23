import styles from "../styles/TitleCircle.module.scss";

import TitleIcon from "./svgs/TitleIcon";

const TitleCircle = () => {
  return (
    <div className={styles.container}>
      <TitleIcon />
    </div>
  );
};

export default TitleCircle;
