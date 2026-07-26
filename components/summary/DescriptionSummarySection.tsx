/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import InfoIconSummary from "../svgs/InfoIconSummary";
import Tag from "../Tag";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";
import type { EventObjectProps } from "../../pages/events/create";

interface DescriptionSummarySectionProps {
  eventObject: EventObjectProps;
  summaryCategories: {
    id: number;
    name: string;
  }[];
  onClick: (inputId: number) => void;
}

/* Read-only description and category card used by SummaryPage (event
creation). */
const DescriptionSummarySection = ({
  eventObject,
  summaryCategories,
  onClick,
}: DescriptionSummarySectionProps) => {
  return (
    <SummaryCard
      inputId={3}
      Icon={
        <IconCircle Icon={InfoIconSummary} iconClassName={styles.summaryIcon} />
      }
      onClick={onClick}
    >
      <div className={styles.descriptionContainer}>
        {eventObject.eventDescription.split("\n").map((str) => (
          <p key={str} className={styles.descriptionText}>
            {str}
            <br></br>
          </p>
        ))}
      </div>
      <div className={styles.categoryContainer}>
        <p className={styles.categoryLabel}>Kategori(er)</p>
        <div className={styles.categoryTagsContainer}>
          {summaryCategories.map((cat) => (
            <Tag
              key={cat.id}
              text={cat.name}
              active={eventObject.eventActiveCategories.includes(cat.id)}
              noShadow
            />
          ))}
        </div>
      </div>
    </SummaryCard>
  );
};

export default DescriptionSummarySection;
