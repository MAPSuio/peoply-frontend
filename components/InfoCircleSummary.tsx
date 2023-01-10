import InfoIconSummary from "./svgs/InfoIconSummary";

import styles from "../styles/InfoCircleSummary.module.scss";

interface InfoCircleSummaryProps {
  className?: string;
}

const InfoCircleSummary = ({ className }: InfoCircleSummaryProps) => {
  return (
    <div className={styles.container}>
      <InfoIconSummary className={className} />
    </div>
  );
};

export default InfoCircleSummary;
