import PlaceIconSummary from "./svgs/PlaceIconSummary";

import styles from "../styles/PlaceCircleSummary.module.scss";

interface PlaceCircleSummaryProps {
  className?: string;
}

const PlaceCircleSummary = ({ className }: PlaceCircleSummaryProps) => {
  return (
    <div className={styles.container}>
      <PlaceIconSummary className={className} />
    </div>
  );
};

export default PlaceCircleSummary;
