/* Next */
import { StaticImageData } from "next/legacy/image";

/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import ImageIconSummary from "../svgs/ImageIconSummary";
import SummaryEventImage from "./SummaryEventImage";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface ImageSummarySectionProps {
  imageSource: string | StaticImageData;
  onClick: (inputId: number) => void;
}

/* Read-only image card used by SummaryPage (event creation). */
const ImageSummarySection = ({
  imageSource,
  onClick,
}: ImageSummarySectionProps) => {
  return (
    <SummaryCard
      inputId={4}
      Icon={
        <IconCircle
          Icon={ImageIconSummary}
          iconClassName={styles.summaryIcon}
        />
      }
      onClick={onClick}
    >
      <SummaryEventImage src={imageSource} alt="Bilde av arrangementet" />
    </SummaryCard>
  );
};

export default ImageSummarySection;
