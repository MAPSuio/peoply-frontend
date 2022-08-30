import styles from "../styles/Tag.module.scss";

interface TagProps {
  text: string;
  active: boolean;
  onClick?: () => void;
  style?: string;
}

const Tag = ({ text, active, onClick, style }: TagProps) => {
  const getTagStyles = () => {
    if (active) {
      return `${styles.tagContainer} ${styles.active}`;
    }
    return `${styles.tagContainer} ${style}`;
  };

  const tagStyles = getTagStyles();

  if (onClick) {
    return (
      <button className={tagStyles} onClick={onClick}>
        {text}
      </button>
    );
  } else {
    return <button className={tagStyles}>{text}</button>;
  }
};

export default Tag;
