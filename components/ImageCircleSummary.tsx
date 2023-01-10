import ImageIconSummary from "./svgs/ImageIconSummary";

import styles from "../styles/ImageCircleSummary.module.scss";

interface ImageCircleSummaryProps {
  className?: string;
}

const ImageCircleSummary = ({ className }: ImageCircleSummaryProps) => {
  return (
    <div className={styles.container}>
      <ImageIconSummary className={className} />
    </div>
  );
};

export default ImageCircleSummary;
