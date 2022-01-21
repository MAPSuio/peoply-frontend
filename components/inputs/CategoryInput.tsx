import Tag from "../Tag";

import styles from "../../styles/CategoryInput.module.scss";

interface CategoryInputProps {
  categories: Array<{ id: number; text: string }>;
  activeCategories: Array<number>;
  onClick: (categoryId: number) => void;
}

const CategoryInput = ({
  categories,
  activeCategories,
  onClick,
}: CategoryInputProps) => {
  return (
    <div className={styles.categoryInputWrapper}>
      <p className={styles.categoryText}>Kategori(er)</p>
      <div className={styles.categoryInputContainer}>
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
    </div>
  );
};

export default CategoryInput;
