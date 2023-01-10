import PlaceIcon from "./svgs/PlaceIcon";

import styles from "../styles/PlaceCircle.module.scss";

interface PlaceCircleProps {
  className?: string;
}

export default function PlaceCircle({ className }: PlaceCircleProps) {
  return (
    <div className={styles.container}>
      <PlaceIcon className={className} />
    </div>
  );
}
