// Components.
import DateInput from "../inputs/DateInput";
import TimeInput from "../inputs/TimeInput";
import InputPage from "../InputPage";

import PlusIcon from "../svgs/PlusIcon";
import MinusIcon from "../svgs/MinusIcon";

// Utils.
import { getInputPageData } from "../../utils/functions";

// Types.
import { InputPages } from "../../types/types";
import { EventObjectProps } from "../../hooks/useCreateEventForm";

// Styles.
import styles from "../../styles/CreateEvent.module.scss";

interface DateStepProps {
  eventObject: EventObjectProps;
  stepCount: number;
  validDataMap: Map<InputPages, boolean>;
  buttonOnClick: (step: number) => void;
  eventDateStartValid: boolean;
  eventTimeStartValid: boolean;
  eventDateEndValid: boolean;
  eventTimeEndValid: boolean;
  regStartDateValid: boolean;
  regStartTimeValid: boolean;
  regEndDateValid: boolean;
  regEndTimeValid: boolean;
  updateEventDateStart: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateEventTimeStart: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setEventHasDateEnd: (value: boolean) => void;
  updateEventDateEnd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateEventTimeEnd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  seteventHasRegStart: (value: boolean) => void;
  updateEventRegStartDate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateEventRegStartTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
  seteventHasRegEnd: (value: boolean) => void;
  updateEventRegEndDate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateEventRegEndTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateStep = ({
  eventObject,
  stepCount,
  validDataMap,
  buttonOnClick,
  eventDateStartValid,
  eventTimeStartValid,
  eventDateEndValid,
  eventTimeEndValid,
  regStartDateValid,
  regStartTimeValid,
  regEndDateValid,
  regEndTimeValid,
  updateEventDateStart,
  updateEventTimeStart,
  setEventHasDateEnd,
  updateEventDateEnd,
  updateEventTimeEnd,
  seteventHasRegStart,
  updateEventRegStartDate,
  updateEventRegStartTime,
  seteventHasRegEnd,
  updateEventRegEndDate,
  updateEventRegEndTime,
}: DateStepProps) => {
  const step = 1;
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
      page={InputPages.DATE_PAGE}
      buttonOnClick={buttonOnClick}
      placeButtonStatic={[
        eventObject.eventHasDateEnd,
        eventObject.eventHasRegStart,
        eventObject.eventHasRegEnd,
        eventObject.eventHasExternalRegistration,
      ].some((cond) => cond)}
    >
      <div className={styles.dateContainer}>
        <div className={styles.dateColumn}>
          <DateInput
            value={eventObject.eventDateStart}
            valid={eventDateStartValid}
            inputId="dateStart"
            inputName="eventDateStart"
            label="Dato start"
            errorMessage="Dato må være i dag eller i fremtiden."
            required
            handleChange={updateEventDateStart}
          />
          <TimeInput
            value={eventObject.eventTimeStart}
            valid={eventTimeStartValid}
            inputId="timeStart"
            inputName="eventTimeStart"
            label="Tidspunkt start"
            errorMessage="Tiden må være i fremtiden."
            required
            handleChange={updateEventTimeStart}
          />
        </div>
        {!eventObject.eventHasDateEnd && (
          <button
            className={styles.addDateContainer}
            onClick={() => setEventHasDateEnd(true)}
          >
            <PlusIcon className={styles.addDateDimensions} />
            <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
          </button>
        )}
        {eventObject.eventHasDateEnd && (
          <button
            className={styles.addDateContainer}
            onClick={() => setEventHasDateEnd(false)}
          >
            <MinusIcon className={styles.addDateDimensions} />
            <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
          </button>
        )}
        {eventObject.eventHasDateEnd && (
          <div className={styles.dateContainer}>
            <div className={styles.dateColumn}>
              <DateInput
                value={eventObject.eventDateEnd || ""}
                valid={eventDateEndValid}
                inputId="dateEnd"
                inputName="eventDateEnd"
                label="Dato slutt"
                errorMessage="Sluttdato kan ikke være før startdato."
                required
                handleChange={updateEventDateEnd}
              />
              <TimeInput
                value={eventObject.eventTimeEnd || ""}
                valid={eventTimeEndValid}
                inputId="timeEnd"
                inputName="eventTimeEnd"
                label="Tidspunkt slutt"
                errorMessage="Sluttidspunkt kan ikke være før starttidspunkt."
                required
                handleChange={updateEventTimeEnd}
              />
            </div>
          </div>
        )}
        <div className={styles.scheduledRegContainer}>
          {!eventObject.eventHasRegStart && (
            <button
              className={styles.addDateContainer}
              onClick={() => seteventHasRegStart(true)}
            >
              <PlusIcon className={styles.addDateDimensions} />
              <p className={styles.addDateText}>Påmeldingen åpner</p>
            </button>
          )}
          {eventObject.eventHasRegStart && (
            <button
              className={styles.addDateContainer}
              onClick={() => seteventHasRegStart(false)}
            >
              <MinusIcon className={styles.addDateDimensions} />
              <p className={styles.addDateText}>Påmeldingen åpner</p>
            </button>
          )}
          {eventObject.eventHasRegStart && (
            <div className={styles.dateContainer}>
              <div className={styles.dateColumn}>
                <DateInput
                  value={eventObject.eventRegStartDate || ""}
                  valid={regStartDateValid}
                  inputId="regDateStart"
                  inputName="eventRegDateStart"
                  label="Dato åpning"
                  errorMessage="Påmelding må åpne før startdato."
                  required
                  handleChange={updateEventRegStartDate}
                />
                <TimeInput
                  value={eventObject.eventRegStartTime || ""}
                  valid={regStartTimeValid}
                  inputId="regTimeStart"
                  inputName="eventRegTimeStart"
                  label="Tidspunkt åpning"
                  errorMessage="Påmelding må åpne før startdato."
                  required
                  handleChange={updateEventRegStartTime}
                />
              </div>
            </div>
          )}
        </div>
        <div className={styles.scheduledRegContainer}>
          {!eventObject.eventHasRegEnd && (
            <button
              className={styles.addDateContainer}
              onClick={() => seteventHasRegEnd(true)}
            >
              <PlusIcon className={styles.addDateDimensions} />
              <p className={styles.addDateText}>Påmeldingen stenger</p>
            </button>
          )}
          {eventObject.eventHasRegEnd && (
            <button
              className={styles.addDateContainer}
              onClick={() => seteventHasRegEnd(false)}
            >
              <MinusIcon className={styles.addDateDimensions} />
              <p className={styles.addDateText}>Påmeldingen stenger</p>
            </button>
          )}
          {eventObject.eventHasRegEnd && (
            <div className={styles.dateContainer}>
              <div className={styles.dateColumn}>
                <DateInput
                  value={eventObject.eventRegEndDate || ""}
                  valid={regEndDateValid}
                  inputId="regDateEnd"
                  inputName="eventRegDateEnd"
                  label="Dato frist"
                  errorMessage="Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato."
                  required
                  handleChange={updateEventRegEndDate}
                />
                <TimeInput
                  value={eventObject.eventRegEndTime || ""}
                  valid={regEndTimeValid}
                  inputId="regTimeEnd"
                  inputName="eventRegTimeEnd"
                  label="Tidspunkt frist"
                  errorMessage="Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato"
                  required
                  handleChange={updateEventRegEndTime}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </InputPage>
  );
};

export default DateStep;
