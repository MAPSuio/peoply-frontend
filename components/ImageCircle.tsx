import ImageIcon from "./svgs/ImageIcon";

import styles from "../styles/ImageCircle.module.scss";

interface ImageCircleProps {
  className?: string;
}

const ImageCircle = ({ className }: ImageCircleProps) => {
  return (
    <div className={styles.container}>
      <ImageIcon className={className} />
    </div>
  );
};

export default ImageCircle;
