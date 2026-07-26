import type { ChangeEvent, Dispatch, SetStateAction } from "react";

/* Components */
import SummaryCard from "../SummaryCard";
import TitleCircle from "../TitleCircle";
import TextInput from "../inputs/TextInput";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface EditTitleSectionProps {
  title: string;
  tempTitle: string;
  validTitle: boolean;
  setValidTitle: Dispatch<SetStateAction<boolean>>;
  editOpen: boolean;
  editButtonOnClick: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCheck: () => void;
  onCross: () => void;
}

/* Editable title card used by EditSummaryPage (event editing). */
const EditTitleSection = ({
  title,
  tempTitle,
  validTitle,
  setValidTitle,
  editOpen,
  editButtonOnClick,
  onChange,
  onCheck,
  onCross,
}: EditTitleSectionProps) => {
  return (
    <SummaryCard
      inputId={0}
      Icon={<TitleCircle className={styles.summaryIcon} />}
      editButtonVisible
      editButtonDisabled={editOpen}
      onCheck={onCheck}
      onCross={onCross}
      editButtonOnClick={editButtonOnClick}
      valid={validTitle}
      inputComponent={
        <TextInput
          value={tempTitle}
          inputId="title"
          inputName="eventTitle"
          label="Endre tittel på arrangementet"
          placeholder={tempTitle}
          maxLength={100}
          minLength={3}
          errorMessage={`Tittelen må være mellom ${3} og ${100} tegn`}
          required={false}
          handleChange={onChange}
          setValid={setValidTitle}
          valid={validTitle}
          validate
          noExtraInfo
          card
        />
      }
    >
      <p className={styles.titleText}>{title}</p>
    </SummaryCard>
  );
};

export default EditTitleSection;
