import styles from "../styles/Tag.module.scss";

interface TagProps {
  text: string;
  active: boolean;
  onClick?: () => void;
  style?: string;
  noShadow?: boolean;
}

const Tag = ({ text, active, onClick, style, noShadow }: TagProps) => {
  const tagStyles = (() => {
    if (active) {
      return `${styles.tagContainer} ${styles.active} ${
        noShadow && styles.noShadow
      }`;
    }
    return `${styles.tagContainer} ${style} ${noShadow && styles.noShadow}`;
  })();

  if (onClick) {
    return (
      <button type="button" className={tagStyles} onClick={onClick}>
        {text}
      </button>
    );
  } else {
    return (
      <button type="button" className={tagStyles}>
        {text}
      </button>
    );
  }
};

export default Tag;
