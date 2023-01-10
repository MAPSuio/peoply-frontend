import DataIconSummary from "./svgs/DataIconSummary";

import styles from "../styles/DataCircleSummary.module.scss";

interface DataCircleSummaryProps {
  className?: string;
}

const DataCircleSummary = ({ className }: DataCircleSummaryProps) => {
  return (
    <div className={styles.container}>
      <DataIconSummary className={className} />
    </div>
  );
};

export default DataCircleSummary;
