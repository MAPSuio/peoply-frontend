import { ChangeEvent, Dispatch, SetStateAction } from "react";

/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import InfoIconSummary from "../svgs/InfoIconSummary";
import TextInputLong from "../inputs/TextInputLong";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface EditDescriptionSectionProps {
  editOpen: boolean;
  editButtonOnClick: () => void;
  onCheck: () => void;
  onCross: () => void;
  validDescription: boolean;
  setValidDescription: Dispatch<SetStateAction<boolean>>;
  tempDescription: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

/* Editable description card used by EditSummaryPage (event editing). */
const EditDescriptionSection = ({
  editOpen,
  editButtonOnClick,
  onCheck,
  onCross,
  validDescription,
  setValidDescription,
  tempDescription,
  onChange,
}: EditDescriptionSectionProps) => {
  return (
    <SummaryCard
      onCheck={onCheck}
      onCross={onCross}
      editButtonOnClick={editButtonOnClick}
      editButtonDisabled={editOpen}
      inputId={4}
      Icon={
        <IconCircle Icon={InfoIconSummary} iconClassName={styles.summaryIcon} />
      }
      editButtonVisible
      valid={validDescription}
      inputComponent={
        <>
          <TextInputLong
            value={tempDescription}
            inputId="description"
            inputName="eventTitle"
            label="Endre beskrivelse av arrangementet"
            placeholder={tempDescription}
            maxLength={2500}
            errorMessage="Beskrivelsen kan ikke være tom"
            required={false}
            handleChange={onChange}
            setValid={setValidDescription}
            valid={validDescription}
            validate
            noExtraInfo
            card
          />
        </>
      }
    >
      <div className={styles.descriptionText}>{tempDescription}</div>
    </SummaryCard>
  );
};

export default EditDescriptionSection;
