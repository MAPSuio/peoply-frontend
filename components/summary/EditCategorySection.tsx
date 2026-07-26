import { Dispatch, SetStateAction } from "react";

/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import InfoIconSummary from "../svgs/InfoIconSummary";
import CategoryInput from "../inputs/CategoryInput";
import Tag from "../Tag";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface EditCategorySectionProps {
  editOpen: boolean;
  editButtonOnClick: () => void;
  onCheck: () => void;
  onCross: () => void;
  validCategories: boolean;
  setValidCategories: Dispatch<SetStateAction<boolean>>;
  allCategories: any;
  categoryIds: number[];
  onCategoryClick: (id: number) => void;
}

/* Editable category card used by EditSummaryPage (event editing). */
const EditCategorySection = ({
  editOpen,
  editButtonOnClick,
  onCheck,
  onCross,
  validCategories,
  setValidCategories,
  allCategories,
  categoryIds,
  onCategoryClick,
}: EditCategorySectionProps) => {
  return (
    <SummaryCard
      onCheck={onCheck}
      onCross={onCross}
      editButtonOnClick={editButtonOnClick}
      editButtonDisabled={editOpen}
      inputId={5}
      Icon={
        <IconCircle Icon={InfoIconSummary} iconClassName={styles.summaryIcon} />
      }
      editButtonVisible
      valid={validCategories}
      inputComponent={
        <CategoryInput
          categories={allCategories}
          activeCategories={categoryIds}
          errorMessage="Du må velge minst en kategori."
          onClick={onCategoryClick}
          style={styles.categoryTag}
          setValid={setValidCategories}
          valid={validCategories}
          noExtraInfo
        />
      }
    >
      <div className={styles.categoryContainer}>
        <p className={styles.categoryLabel}>Kategori(er)</p>
        <div className={styles.categoryTagsContainer}>
          {categoryIds !== undefined &&
            categoryIds.map((categoryId) => {
              return (
                <Tag
                  key={categoryId}
                  text={
                    allCategories !== undefined
                      ? allCategories.find((c: any) => c.id === categoryId)
                          ?.name
                      : "..."
                  }
                  active={true}
                />
              );
            })}
        </div>
      </div>
    </SummaryCard>
  );
};

export default EditCategorySection;
