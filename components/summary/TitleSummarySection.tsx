/* Components */
import SummaryCard from "../SummaryCard";
import TitleCircle from "../TitleCircle";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface TitleSummarySectionProps {
  title: string;
  onClick: (inputId: number) => void;
}

/* Read-only title card used by SummaryPage (event creation). */
const TitleSummarySection = ({ title, onClick }: TitleSummarySectionProps) => {
  return (
    <SummaryCard
      inputId={0}
      Icon={<TitleCircle className={styles.summaryIcon} />}
      onClick={onClick}
    >
      <p className={styles.titleText}>{title}</p>
    </SummaryCard>
  );
};

export default TitleSummarySection;
