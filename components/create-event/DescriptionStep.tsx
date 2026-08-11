// React.
import type { ChangeEvent, Dispatch, SetStateAction } from "react";

// Components.
import TextInputLong from "../inputs/TextInputLong";
import CategoryInput from "../inputs/CategoryInput";
import InputPage from "../InputPage";

// Utils.
import { getInputPageData } from "../../utils/functions";
import { eventDescriptionMaxLength } from "../../utils/constants";

// Types.
import { InputPages } from "../../types/types";
import type { EventObjectProps } from "../../hooks/useCreateEventForm";

// Styles.
import styles from "../../styles/CreateEvent.module.scss";

interface DescriptionStepProps {
  eventObject: EventObjectProps;
  stepCount: number;
  validDataMap: Map<InputPages, boolean>;
  buttonOnClick: (step: number) => void;
  categories: Array<{ id: number; name: string }>;
  updateEventDescription: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  eventDescriptionValid: boolean;
  setEventDescriptionValid: Dispatch<SetStateAction<boolean>>;
  updateEventCategories: (categoryId: number) => void;
  eventActiveCategoriesValid: boolean;
  setEventActiveCategoriesValid: Dispatch<SetStateAction<boolean>>;
}

const DescriptionStep = ({
  eventObject,
  stepCount,
  validDataMap,
  buttonOnClick,
  categories,
  updateEventDescription,
  eventDescriptionValid,
  setEventDescriptionValid,
  updateEventCategories,
  eventActiveCategoriesValid,
  setEventActiveCategoriesValid,
}: DescriptionStepProps) => {
  const step = 3;
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
      page={InputPages.DESCRIPTION_PAGE}
      buttonOnClick={buttonOnClick}
    >
      <div className={styles.textContainer}>
        <div className={styles.column}>
          <TextInputLong
            value={eventObject.eventDescription}
            inputId="description"
            inputName="eventDescription"
            rows={12}
            label="Beskrivelse av arrangementet"
            placeholder="F.eks. Peoply inviterer til julebord. Det blir god mat og forhåpentligvis god stemning!"
            maxLength={eventDescriptionMaxLength}
            errorMessage="Beskrivelsen kan ikke være tom"
            required
            handleChange={updateEventDescription}
            validate
            valid={eventDescriptionValid}
            setValid={setEventDescriptionValid}
          />
          <CategoryInput
            categories={categories}
            activeCategories={eventObject.eventActiveCategories}
            errorMessage="Du må velge minst en kategori."
            onClick={updateEventCategories}
            setValid={setEventActiveCategoriesValid}
            valid={eventActiveCategoriesValid}
          />
        </div>
      </div>
    </InputPage>
  );
};

export default DescriptionStep;
