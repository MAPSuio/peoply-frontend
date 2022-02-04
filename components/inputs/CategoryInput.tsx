import Tag from "../Tag";
import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/CategoryInput.module.scss";

interface CategoryInputProps {
  categories: Array<{ category_id: number; category: string }>;
  activeCategories: Array<number>;
  errorMessage: string;
  onClick: (categoryId: number) => void;
}

const CategoryInput = ({
  categories,
  activeCategories,
  errorMessage,
  onClick,
}: CategoryInputProps) => {
  const getCategoryContainerStyles = () => {
    return activeCategories.length > 0
      ? `${styles.categoryInputContainer} ${styles.noErrorPadding}`
      : styles.categoryInputContainer;
  };

  const valid = activeCategories.length > 0;
  const categoryContainerStyles = getCategoryContainerStyles();

  return (
    <div className={styles.categoryInputWrapper}>
      <p className={styles.categoryLabel}>Kategori(er)</p>
      <div className={categoryContainerStyles}>
        {categories.map((cat) => {
          return (
            <Tag
              key={cat.category_id}
              id={cat.category_id}
              text={cat.category}
              activeCategories={activeCategories}
              onClick={onClick}
            />
          );
        })}
      </div>
      {!valid && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIconDimensions} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryInput;
