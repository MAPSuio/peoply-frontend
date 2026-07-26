// Components.
import RadioInput from "../inputs/RadioInput";
import NumberInput from "../inputs/NumberInput";
import CheckboxInput from "../inputs/CheckboxInput";
import TextInput from "../inputs/TextInput";
import TextInputLong from "../inputs/TextInputLong";
import InputPage from "../InputPage";

import NoLimitIcon from "../svgs/NoLimitIcon";
import LimitIcon from "../svgs/LimitIcon";
import UnlistedIcon from "../svgs/UnlistedIcon";
import PublicIcon from "../svgs/PublicIcon";
import NoFoodIcon from "../svgs/NoFoodIcon";
import FoodIcon from "../svgs/FoodIcon";

// Utils.
import { getInputPageData } from "../../utils/functions";

// Types.
import { InputPages, Visibility } from "../../types/types";
import type { EventObjectProps } from "../../hooks/useCreateEventForm";

// Styles.
import styles from "../../styles/CreateEvent.module.scss";

interface ExtraInfoStepProps {
  eventObject: EventObjectProps;
  stepCount: number;
  validDataMap: Map<InputPages, boolean>;
  buttonOnClick: (step: number) => void;
  setEventExtraInfoValid: (eventExtraInfoValid: boolean) => void;
  updateVisibility: (id: number) => void;
  updateHasCapacity: (id: number) => void;
  updateEventCapacity: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateHasFood: (id: number) => void;
  setEventHasExternalRegistration: (value: boolean) => void;
  updateEventExternalUrl: (e: React.ChangeEvent<HTMLInputElement>) => void;
  externalRegistrationUrlValid: boolean;
  setEventHasFormQuestion: (value: boolean) => void;
  updateEventFormQuestion: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ExtraInfoStep = ({
  eventObject,
  stepCount,
  validDataMap,
  buttonOnClick,
  setEventExtraInfoValid,
  updateVisibility,
  updateHasCapacity,
  updateEventCapacity,
  updateHasFood,
  setEventHasExternalRegistration,
  updateEventExternalUrl,
  externalRegistrationUrlValid,
  setEventHasFormQuestion,
  updateEventFormQuestion,
}: ExtraInfoStepProps) => {
  const step = 5;
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
      placeButtonStatic
      validDataMap={validDataMap}
      page={InputPages.EXTRA_INFO_PAGE}
      setEventExtraInfoValid={setEventExtraInfoValid}
      buttonOnClick={buttonOnClick}
    >
      <div className={`${styles.column} ${styles.gapLarge}`}>
        <div>
          <RadioInput
            optionsAndIcons={[
              {
                id: 1,
                text: "offentlig",
                hintText:
                  "Synlig for offentligheten. Vises for alle i appen, inkludert personer uten brukerkonto.",
                icon: PublicIcon,
                active: eventObject.eventVisibility === Visibility.PUBLIC,
              },
              {
                id: 2,
                text: "ikke oppført",
                hintText:
                  "Ikke synlig for offentligheten, men alle med lenken kan se arrangementet, inkludert personer uten brukerkonto.",
                icon: UnlistedIcon,
                active: eventObject.eventVisibility === Visibility.UNLISTED,
              },
            ]}
            onClick={updateVisibility}
            label="Privat eller ikke oppført arrangement?"
          />
        </div>
        <div>
          <RadioInput
            optionsAndIcons={[
              {
                id: 1,
                text: "ingen",
                icon: NoLimitIcon,
                active: !eventObject.eventHasCapacity,
              },
              {
                id: 2,
                text: "begrensning",
                icon: LimitIcon,
                active: eventObject.eventHasCapacity,
              },
            ]}
            onClick={updateHasCapacity}
            label="Skal arrangementet ha begrenset antall deltakere?"
          />
          {eventObject.eventHasCapacity && (
            <NumberInput
              value={eventObject.eventCapacity}
              inputId="capacity"
              inputName="eventCapacity"
              label="Antall deltakere"
              placeholder="0"
              min="1"
              errorMessage="Antall deltakere kan ikke være tom eller null."
              required
              handleChange={updateEventCapacity}
            />
          )}
        </div>
        <div className={styles.eventHasFood}>
          <RadioInput
            optionsAndIcons={[
              {
                id: 1,
                text: "Ingen matsevering",
                hintText:
                  "Mat skal ikke serveres. Du får da ikke tilgang på deltakerenes matpreferanser.",
                icon: NoFoodIcon,
                active: !eventObject.eventHasFood,
              },
              {
                id: 2,
                text: "Det serveres mat",
                hintText:
                  "Det blir servert mat på arrangementet. Deltakernes matpreferanser vil bli synlig i deltakerlisten.",
                icon: FoodIcon,
                active: eventObject.eventHasFood,
              },
            ]}
            onClick={updateHasFood}
            label="Skal det serveres mat på arrangementet?"
          />
        </div>
        <div className={styles.participantQuestion}>
          <CheckboxInput
            onChange={() =>
              setEventHasExternalRegistration(
                !eventObject.eventHasExternalRegistration,
              )
            }
            checked={eventObject.eventHasExternalRegistration}
            label="Ekstern påmelding"
            checkboxId="ExternalRegistration"
            checkboxName="ExternalRegistration"
          />
          {eventObject.eventHasExternalRegistration && (
            <TextInput
              value={eventObject.eventExternalUrl}
              inputId="eventExternalUrl"
              inputName="eventExternalUrl"
              label="Påmelding URL"
              placeholder="https://example.com/pamelding"
              maxLength={500}
              errorMessage="Legg inn en gyldig URL som starter med http:// eller https://"
              required
              handleChange={updateEventExternalUrl}
              valid={externalRegistrationUrlValid}
              validate
            />
          )}
        </div>
        <div className={styles.FormQuestion}>
          <CheckboxInput
            onChange={() =>
              setEventHasFormQuestion(!eventObject.eventHasFormQuestion)
            }
            checked={eventObject.eventHasFormQuestion}
            label="Spørsmål til deltakere"
            checkboxId="FormQuestion"
            checkboxName="FormQuestion"
          />
          {eventObject.eventHasFormQuestion && (
            <TextInputLong
              value={eventObject.eventFormQuestion ?? ""}
              handleChange={updateEventFormQuestion}
              inputId="FormQuestionInput"
              inputName="FormQuestionInput"
              label="Spørsmål til deltakere"
              maxLength={100}
              placeholder="F.eks. Hva er din favorittmat?"
              errorMessage=""
              rows={4}
              required
            />
          )}
        </div>
      </div>
    </InputPage>
  );
};

export default ExtraInfoStep;
