// React.
import { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";

// Components.
import TextInput from "../inputs/TextInput";
import Dropdown from "../Dropdown";
import InputPage from "../InputPage";

// Utils.
import { getInputPageData } from "../../utils/functions";
import {
  eventTitleMaxLength,
  eventTitleMinLength,
} from "../../utils/constants";

// Types.
import { InputPages } from "../../types/types";
import { EventObjectProps } from "../../hooks/useCreateEventForm";

// Styles.
import styles from "../../styles/CreateEvent.module.scss";

interface TitleStepProps {
  eventObject: EventObjectProps;
  stepCount: number;
  validDataMap: Map<InputPages, boolean>;
  buttonOnClick: (step: number) => void;
  updateEventTitle: (e: ChangeEvent<HTMLInputElement>) => void;
  eventTitleValid: boolean;
  setEventTitleValid: Dispatch<SetStateAction<boolean>>;
  validArrangersOptions: { value: any; label: string }[];
  updateEventArrangerId: (arrangerId: string) => void;
  coOrganizerOptions: { id: string; label: string }[];
  visibleCoOrganizerOptions: { id: string; label: string }[];
  selectedCoOrganizerNames: string[];
  coOrganizerSearch: string;
  setCoOrganizerSearch: (value: string) => void;
  coOrganizerOpen: boolean;
  setCoOrganizerOpen: (open: boolean) => void;
  coOrganizerCardRef: RefObject<HTMLDivElement | null>;
  toggleCoOrganizerOrganization: (organizationId: string) => void;
}

const TitleStep = ({
  eventObject,
  stepCount,
  validDataMap,
  buttonOnClick,
  updateEventTitle,
  eventTitleValid,
  setEventTitleValid,
  validArrangersOptions,
  updateEventArrangerId,
  coOrganizerOptions,
  visibleCoOrganizerOptions,
  selectedCoOrganizerNames,
  coOrganizerSearch,
  setCoOrganizerSearch,
  coOrganizerOpen,
  setCoOrganizerOpen,
  coOrganizerCardRef,
  toggleCoOrganizerOrganization,
}: TitleStepProps) => {
  const step = 0;
  const { title, subTitle, buttonText } = getInputPageData(step);

  return (
    <InputPage
      step={step}
      title={title}
      subTitle={subTitle}
      currentStep={eventObject.currentStep}
      reachedStep={eventObject.reachedStep}
      stepCount={stepCount}
      buttonText={buttonText}
      validDataMap={validDataMap}
      page={InputPages.TITLE_PAGE}
      firstPage
      buttonOnClick={buttonOnClick}
    >
      <div className={styles.textContainer}>
        <TextInput
          value={eventObject.eventTitle}
          inputId="title"
          inputName="eventTitle"
          label="Tittel på arrangementet"
          placeholder="F.eks. Peoply launch party"
          maxLength={eventTitleMaxLength}
          minLength={eventTitleMinLength}
          errorMessage={`Tittelen må være mellom ${eventTitleMinLength} og ${eventTitleMaxLength} tegn`}
          required
          handleChange={updateEventTitle}
          setValid={setEventTitleValid}
          valid={eventTitleValid}
          validate
        />
        {validArrangersOptions.length > 0 && (
          <Dropdown
            label="Opprett arrangementet som: "
            options={validArrangersOptions}
            value={eventObject.eventArrangerId}
            inputId="arrangerInput"
            className={styles.arrangerInput}
            setValue={updateEventArrangerId}
          />
        )}
        {coOrganizerOptions.length > 0 && (
          <div className={styles.coOrganizerCard} ref={coOrganizerCardRef}>
            <div className={styles.coOrganizerHeader}>
              <h2>Medarrangører</h2>
              <p>Legg til en eller flere foreninger.</p>
            </div>
            <div className={styles.coOrganizerField}>
              <input
                id="coOrganizerSearch"
                className={styles.coOrganizerSearchInput}
                type="text"
                role="combobox"
                value={coOrganizerSearch}
                onFocus={() => setCoOrganizerOpen(true)}
                onClick={() => setCoOrganizerOpen(true)}
                onChange={(event) => {
                  setCoOrganizerOpen(true);
                  setCoOrganizerSearch(event.target.value);
                }}
                placeholder="Søk etter forening"
                aria-autocomplete="list"
                aria-expanded={coOrganizerOpen}
                aria-haspopup="listbox"
                aria-controls="coOrganizerOptions"
              />
              {coOrganizerOpen && (
                <div
                  id="coOrganizerOptions"
                  className={styles.coOrganizerOptionList}
                  role="listbox"
                >
                  {visibleCoOrganizerOptions.map((organization) => (
                    <button
                      key={organization.id}
                      type="button"
                      role="option"
                      aria-selected={eventObject.eventCoOrganizerOrganizationIds.includes(
                        organization.id,
                      )}
                      className={`${styles.coOrganizerOptionButton} ${
                        eventObject.eventCoOrganizerOrganizationIds.includes(
                          organization.id,
                        )
                          ? styles.coOrganizerOptionButtonSelected
                          : ""
                      }`}
                      onClick={() =>
                        toggleCoOrganizerOrganization(organization.id)
                      }
                    >
                      <span>{organization.label}</span>
                    </button>
                  ))}
                  {visibleCoOrganizerOptions.length === 0 && (
                    <p className={styles.coOrganizerEmptyText}>
                      Ingen foreninger matcher søket.
                    </p>
                  )}
                </div>
              )}
            </div>
            {selectedCoOrganizerNames.length > 0 && (
              <div className={styles.coOrganizerTags}>
                {selectedCoOrganizerNames.map((organizationName) => (
                  <span
                    key={organizationName}
                    className={styles.coOrganizerTag}
                  >
                    {organizationName}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </InputPage>
  );
};

export default TitleStep;
