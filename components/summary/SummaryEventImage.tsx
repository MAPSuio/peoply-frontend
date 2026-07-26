/* Next */
import Image, { type StaticImageData } from "next/legacy/image";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface SummaryEventImageProps {
  src: string | StaticImageData;
  alt: string;
}

/* Shared between SummaryPage and EditSummaryPage: renders the event image
inside the image summary card. Callers pass their own `alt` text since it
differs slightly between the two pages. */
const SummaryEventImage = ({ src, alt }: SummaryEventImageProps) => {
  return (
    <div className={styles.imageContainer}>
      <Image
        src={src}
        alt={alt}
        objectFit="cover"
        layout="fill"
        objectPosition="center"
      />
    </div>
  );
};

export default SummaryEventImage;
