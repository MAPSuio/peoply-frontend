import Tag from "../Tag";
import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/CategoryInput.module.scss";

interface CategoryInputProps {
  categories: Array<{ id: number; name: string }>;
  activeCategories: Array<number>;
  errorMessage: string;
  onClick: (categoryId: number) => void;
  style?: string;
  setValid?: React.Dispatch<React.SetStateAction<boolean>>;
  valid?: boolean;
}

const CategoryInput = ({
  categories,
  activeCategories,
  errorMessage,
  onClick,
  style,
  setValid,
  valid,
}: CategoryInputProps) => {
  const getCategoryContainerStyles = () => {
    return activeCategories.length > 0
      ? `${styles.categoryInputContainer} ${styles.noErrorPadding}`
      : styles.categoryInputContainer;
  };

  if (setValid) {
    setValid(activeCategories.length > 0);
  }

  const categoryContainerStyles = getCategoryContainerStyles();

  return (
    <div className={styles.categoryInputWrapper}>
      <p className={styles.categoryLabel}>Kategori(er)</p>
      <div className={categoryContainerStyles}>
        {categories.map((cat) => {
          return (
            <Tag
              key={cat.id}
              text={cat.name}
              active={activeCategories.includes(cat.id)}
              onClick={() => onClick(cat.id)}
              style={style}
            />
          );
        })}
      </div>
      {!valid && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default CategoryInput;
