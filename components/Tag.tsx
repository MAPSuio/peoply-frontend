import styles from "../styles/Tag.module.scss";

interface TagProps {
  id: number;
  text: string;
  activeCategories: Array<number>;
  onClick: (categoryId: number) => void;
}

const Tag = ({ id, text, activeCategories, onClick }: TagProps) => {
  const isActive = () => {
    return activeCategories.includes(id);
  };

  const getTagStyles = () => {
    if (active) {
      return `${styles.tagContainer} ${styles.active}`;
    }
    return `${styles.tagContainer}`;
  };

  const active = isActive();
  const tagStyles = getTagStyles();

  return (
    <div className={tagStyles} onClick={() => onClick(id)}>
      {text}
    </div>
  );
};

export default Tag;
