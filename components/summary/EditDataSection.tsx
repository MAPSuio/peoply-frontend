import { ChangeEvent, Dispatch, SetStateAction } from "react";

/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import DataIconSummary from "../svgs/DataIconSummary";
import RadioInput from "../inputs/RadioInput";
import NumberInput from "../inputs/NumberInput";
import CheckboxInput from "../inputs/CheckboxInput";
import TextInput from "../inputs/TextInput";
import VisibilityIndicator from "./VisibilityIndicator";

/* Icons */
import UnlistedIcon from "../svgs/UnlistedIcon";
import PublicIcon from "../svgs/PublicIcon";
import PlusIcon from "../svgs/PlusIcon";
import MinusIcon from "../svgs/MinusIcon";

/* Types */
import { EventRegistrationMode, Visibility } from "../../types/types";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface EditDataSectionProps {
  editOpen: boolean;
  editButtonOnClick: () => void;
  onCheck: () => void;
  onCross: () => void;
  tempVisibility: Visibility;
  onVisibilityClick: (id: number) => void;
  capacityFieldVisible: boolean;
  onAddCapacityField: () => void;
  onRemoveCapacityField: () => void;
  tempCapacity: number | null | undefined;
  onCapacityChange: (e: ChangeEvent<HTMLInputElement>) => void;
  goingCount: number | undefined;
  externalRegistrationEnabled: boolean;
  onToggleExternalRegistration: () => void;
  tempExternalUrl: string | undefined;
  onExternalUrlChange: (e: ChangeEvent<HTMLInputElement>) => void;
  validExternalUrl: boolean;
  setValidExternalUrl: Dispatch<SetStateAction<boolean>>;
  displayVisibility: Visibility;
  displayCapacity: number | null | undefined;
  displayRegistrationMode: EventRegistrationMode;
  displayExternalUrl: string | undefined;
}

/* Editable data/visibility card used by EditSummaryPage (event editing). */
const EditDataSection = ({
  editOpen,
  editButtonOnClick,
  onCheck,
  onCross,
  tempVisibility,
  onVisibilityClick,
  capacityFieldVisible,
  onAddCapacityField,
  onRemoveCapacityField,
  tempCapacity,
  onCapacityChange,
  goingCount,
  externalRegistrationEnabled,
  onToggleExternalRegistration,
  tempExternalUrl,
  onExternalUrlChange,
  validExternalUrl,
  setValidExternalUrl,
  displayVisibility,
  displayCapacity,
  displayRegistrationMode,
  displayExternalUrl,
}: EditDataSectionProps) => {
  return (
    <SummaryCard
      onCheck={onCheck}
      onCross={onCross}
      editButtonOnClick={editButtonOnClick}
      editButtonDisabled={editOpen}
      inputId={7}
      Icon={
        <IconCircle Icon={DataIconSummary} iconClassName={styles.summaryIcon} />
      }
      editButtonVisible
      inputComponent={
        <>
          <RadioInput
            optionsAndIcons={[
              {
                id: 1,
                text: "offentlig",
                hintText:
                  "Synlig for offentligheten. Vises for alle i appen, inkludert personer uten brukerkonto.",
                icon: PublicIcon,
                active: tempVisibility === Visibility.PUBLIC,
              },
              {
                id: 2,
                text: "ikke oppført",
                hintText:
                  "Ikke synlig for offentligheten, men alle med lenken kan se arrangementet, inkludert personer uten brukerkonto.",
                icon: UnlistedIcon,
                active: tempVisibility === Visibility.UNLISTED,
              },
            ]}
            onClick={onVisibilityClick}
            label="Privat eller ikke oppført arrangement?"
            card
          />
          {!capacityFieldVisible && (
            <button
              className={styles.addDateContainer}
              onClick={onAddCapacityField}
            >
              <PlusIcon className={styles.addDateIcon} />
              <p className={styles.addDateText}>Legg til antall plasser</p>
            </button>
          )}
          {capacityFieldVisible && (
            <>
              <button
                className={styles.addDateContainer}
                onClick={onRemoveCapacityField}
              >
                <MinusIcon
                  className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
                />
                <p className={styles.addDateText}>Fjern antall plasser</p>
              </button>
              <NumberInput
                value={`${tempCapacity ?? ""}`}
                inputId="capacity"
                inputName="eventCapacity"
                label="Antall plasser"
                placeholder="F.eks. 120"
                min={`${Math.max(goingCount ?? 1, 1)}`}
                errorMessage="Antall plasser må være større enn 0"
                required={false}
                handleChange={onCapacityChange}
              />
              {typeof goingCount === "number" && (
                <p
                  className={styles.dateText}
                >{`Du kan ikke sette færre enn ${goingCount} plasser fordi ${goingCount} er påmeldt.`}</p>
              )}
            </>
          )}
          <CheckboxInput
            onChange={onToggleExternalRegistration}
            checked={externalRegistrationEnabled}
            label="Ekstern påmelding"
            checkboxId="externalRegistration"
            checkboxName="externalRegistration"
          />
          {externalRegistrationEnabled && (
            <TextInput
              value={tempExternalUrl ?? ""}
              inputId="externalUrl"
              inputName="externalUrl"
              label="Påmelding URL"
              placeholder="https://example.com/pamelding"
              maxLength={500}
              errorMessage="Legg inn en gyldig URL som starter med http:// eller https://"
              required
              handleChange={onExternalUrlChange}
              setValid={setValidExternalUrl}
              valid={validExternalUrl}
              validate
              noExtraInfo
              card
            />
          )}
        </>
      }
    >
      <div className={styles.dataContainer}>
        <VisibilityIndicator visibility={displayVisibility} />
        {displayCapacity !== null ? (
          <div className={styles.dataItemContainer}>
            <p className={styles.dataLabel}>{`${displayCapacity} plasser`}</p>
          </div>
        ) : (
          <div className={styles.dataItemContainer}>
            <p className={styles.dataLabel}>Ubegrenset antall plasser</p>
          </div>
        )}
        <div className={styles.dataItemContainer}>
          <p className={styles.dataLabel}>
            {displayRegistrationMode === EventRegistrationMode.EXTERNAL
              ? "Ekstern påmelding"
              : displayRegistrationMode === EventRegistrationMode.NONE
                ? "Ingen påmelding"
                : "Påmelding i Peoply"}
          </p>
        </div>
        {displayRegistrationMode === EventRegistrationMode.EXTERNAL &&
          displayExternalUrl && (
            <a
              className={styles.placeText}
              href={displayExternalUrl}
              target="_blank"
              rel="noreferrer"
            >
              {displayExternalUrl}
            </a>
          )}
      </div>
    </SummaryCard>
  );
};

export default EditDataSection;
