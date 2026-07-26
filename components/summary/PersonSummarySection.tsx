/* Components */
import SummaryCard from "../SummaryCard";
import UserCircle from "../UserCircle";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface PersonSummarySectionProps {
  text: string | undefined;
  onClick: (inputId: number) => void;
}

/* Read-only card used by SummaryPage (event creation) for both the
arranger and the co-organizer summary cards - the markup is identical,
only the displayed text and the decision to render it differ, and that
is handled by the caller. */
const PersonSummarySection = ({ text, onClick }: PersonSummarySectionProps) => {
  return (
    <SummaryCard
      inputId={0}
      Icon={<UserCircle large className={styles.summaryIcon} />}
      onClick={onClick}
    >
      <p className={styles.titleText}>{text}</p>
    </SummaryCard>
  );
};

export default PersonSummarySection;
