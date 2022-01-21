import Tag from "../Tag";
import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/CategoryInput.module.scss";

interface CategoryInputProps {
  categories: Array<{ id: number; text: string }>;
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
      <p className={styles.categoryText}>Kategori(er)</p>
      <div className={categoryContainerStyles}>
        {categories.map((cat) => {
          return (
            <Tag
              key={cat.id}
              id={cat.id}
              text={cat.text}
              activeCategories={activeCategories}
              onClick={onClick}
            />
          );
        })}
      </div>
      {!valid && (
        <div className={styles.errorContainer}>
          <ErrorIcon />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryInput;
