import styles from "../styles/PlaceCircle.module.scss";

import PlaceIcon from "./svgs/PlaceIcon";

export default function PlaceCircle() {
  return (
    <div className={styles.container}>
      <PlaceIcon />
    </div>
  );
}
