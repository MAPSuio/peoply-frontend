import type { ChangeEvent, Dispatch, SetStateAction } from "react";

/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import CalendarIconSummary from "../svgs/CalendarIconSummary";
import PlusIcon from "../svgs/PlusIcon";
import MinusIcon from "../svgs/MinusIcon";
import DateInput from "../inputs/DateInput";
import TimeInput from "../inputs/TimeInput";
import TimeView from "../TimeView";

/* Utils */
import { getISODateString, getISOTimeString } from "../../utils/functions";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";
import type { EventObjectProps } from "../EditSummaryPage";

interface EditDateTimeSectionProps {
  editOpen: boolean;
  editButtonOnClick: () => void;
  onCheck: () => void;
  onCross: () => void;
  eventObject: EventObjectProps;
  tempEventObject: EventObjectProps;
  setTempEventObject: Dispatch<SetStateAction<EventObjectProps>>;
  validStart: boolean;
  validEnd: boolean;
  setValidEnd: Dispatch<SetStateAction<boolean>>;
  validRegStart: boolean;
  setValidRegStart: Dispatch<SetStateAction<boolean>>;
  validRegEnd: boolean;
  setValidRegEnd: Dispatch<SetStateAction<boolean>>;
  updateStartDate: (e: ChangeEvent<HTMLInputElement>) => void;
  updateStartTime: (e: ChangeEvent<HTMLInputElement>) => void;
  updateEndDate: (e: ChangeEvent<HTMLInputElement>) => void;
  updateEndTime: (e: ChangeEvent<HTMLInputElement>) => void;
  updateRegStartDate: (e: ChangeEvent<HTMLInputElement>) => void;
  updateRegStartTime: (e: ChangeEvent<HTMLInputElement>) => void;
  updateRegEndDate: (e: ChangeEvent<HTMLInputElement>) => void;
  updateRegEndTime: (e: ChangeEvent<HTMLInputElement>) => void;
}

/* Editable date/time card used by EditSummaryPage (event editing). */
const EditDateTimeSection = ({
  editOpen,
  editButtonOnClick,
  onCheck,
  onCross,
  eventObject,
  tempEventObject,
  setTempEventObject,
  validStart,
  validEnd,
  setValidEnd,
  validRegStart,
  setValidRegStart,
  validRegEnd,
  setValidRegEnd,
  updateStartDate,
  updateStartTime,
  updateEndDate,
  updateEndTime,
  updateRegStartDate,
  updateRegStartTime,
  updateRegEndDate,
  updateRegEndTime,
}: EditDateTimeSectionProps) => {
  return (
    <SummaryCard
      onCheck={onCheck}
      onCross={onCross}
      inputId={2}
      Icon={
        <IconCircle
          Icon={CalendarIconSummary}
          iconClassName={styles.summaryIcon}
        />
      }
      editButtonVisible
      editButtonDisabled={editOpen}
      editButtonOnClick={editButtonOnClick}
      valid={validStart && validEnd}
      inputComponent={
        <>
          <div
            className={`${styles.horizontalContainer} ${styles.marginBottomVerySmall} `}
          >
            <DateInput
              value={getISODateString(tempEventObject.startDate)}
              inputId="dateStart"
              inputName="eventDateStart"
              label="Dato start"
              errorMessage="Dato må være i dag eller i fremtiden."
              handleChange={updateStartDate}
              valid={validStart}
              noExtraInfo
              card
            />
            <TimeInput
              value={getISOTimeString(tempEventObject.startDate)}
              inputId="timeStart"
              inputName="eventTimeStart"
              label="Tidspunkt start"
              errorMessage="Tiden må være i fremtiden."
              handleChange={updateStartTime}
              valid={validStart}
              noExtraInfo
              card
            />
          </div>
          {!tempEventObject.endDate && (
            <button
              type="button"
              className={styles.addDateContainer}
              onClick={() => {
                setTempEventObject({
                  ...tempEventObject,
                  endDate: tempEventObject.startDate,
                });
              }}
            >
              <PlusIcon className={styles.addDateIcon} />
              <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
            </button>
          )}
          {tempEventObject.endDate && (
            <>
              <button
                type="button"
                className={styles.addDateContainer}
                onClick={() => {
                  setTempEventObject({
                    ...tempEventObject,
                    endDate: undefined,
                  });
                  setValidEnd(true);
                }}
              >
                <MinusIcon
                  className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
                />
                <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
              </button>
              <div className={`${styles.horizontalContainer} `}>
                <DateInput
                  value={
                    tempEventObject.endDate
                      ? getISODateString(tempEventObject.endDate)
                      : getISODateString(tempEventObject.startDate)
                  }
                  inputId="dateEnd"
                  inputName="eventDateEnd"
                  label="Dato slutt"
                  errorMessage="Sluttdato kan ikke være før startdato."
                  handleChange={updateEndDate}
                  valid={validEnd}
                  initiallyFocused
                  noExtraInfo
                  card
                />
                <TimeInput
                  value={
                    tempEventObject.endDate
                      ? getISOTimeString(tempEventObject.endDate)
                      : getISOTimeString(tempEventObject.startDate)
                  }
                  inputId="timeEnd"
                  inputName="eventTimeEnd"
                  label="Tidspunkt slutt"
                  errorMessage="Sluttidspunkt kan ikke være før starttidspunkt."
                  handleChange={updateEndTime}
                  valid={validEnd}
                  initiallyFocused
                  noExtraInfo
                  card
                />
              </div>
            </>
          )}
          {!tempEventObject.regStart && (
            <button
              type="button"
              className={styles.addDateContainer}
              onClick={() => {
                setTempEventObject({
                  ...tempEventObject,
                  regStart: tempEventObject.startDate,
                });
              }}
            >
              <PlusIcon className={styles.addDateIcon} />
              <p className={styles.addDateText}>Påmelding åpner</p>
            </button>
          )}
          {tempEventObject.regStart && (
            <>
              <button
                type="button"
                className={styles.addDateContainer}
                onClick={() => {
                  setTempEventObject({
                    ...tempEventObject,
                    regStart: undefined,
                  });
                  setValidRegStart(true);
                }}
              >
                <MinusIcon
                  className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
                />
                <p className={styles.addDateText}>Påmelding åpner</p>
              </button>
              <div className={`${styles.horizontalContainer} `}>
                <DateInput
                  value={
                    tempEventObject.regStart
                      ? getISODateString(tempEventObject.regStart)
                      : ""
                  }
                  inputId="regDateStart"
                  inputName="eventRegDateStart"
                  label="Dato åpning"
                  errorMessage="Påmelding må åpne før startdato."
                  handleChange={updateRegStartDate}
                  valid={validRegStart}
                  initiallyFocused
                  noExtraInfo
                  card
                />
                <TimeInput
                  value={
                    tempEventObject.regStart
                      ? getISOTimeString(tempEventObject.regStart)
                      : ""
                  }
                  inputId="regTimeStart"
                  inputName="eventRegTimeStart"
                  label="Tidspunkt åpning"
                  errorMessage="Påmelding må åpne før startdato."
                  handleChange={updateRegStartTime}
                  valid={validRegStart}
                  initiallyFocused
                  noExtraInfo
                  card
                />
              </div>
            </>
          )}
          {!tempEventObject.regEnd && (
            <button
              type="button"
              className={styles.addDateContainer}
              onClick={() => {
                setTempEventObject({
                  ...tempEventObject,
                  regEnd: tempEventObject.startDate,
                });
              }}
            >
              <PlusIcon className={styles.addDateIcon} />
              <p className={styles.addDateText}>Påmelding stenger</p>
            </button>
          )}
          {tempEventObject.regEnd && (
            <>
              <button
                type="button"
                className={styles.addDateContainer}
                onClick={() => {
                  setTempEventObject({
                    ...tempEventObject,
                    regEnd: undefined,
                  });
                  setValidRegEnd(true);
                }}
              >
                <MinusIcon
                  className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
                />
                <p className={styles.addDateText}>Påmelding stenger</p>
              </button>
              <div className={`${styles.horizontalContainer} `}>
                <DateInput
                  value={
                    tempEventObject.regEnd
                      ? getISODateString(tempEventObject.regEnd)
                      : ""
                  }
                  inputId="regDateEnd"
                  inputName="eventRegDateEnd"
                  label="Dato frist"
                  errorMessage="Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato."
                  handleChange={updateRegEndDate}
                  valid={validRegEnd}
                  initiallyFocused
                  noExtraInfo
                  card
                />
                <TimeInput
                  value={
                    tempEventObject.regEnd
                      ? getISOTimeString(tempEventObject.regEnd)
                      : ""
                  }
                  inputId="regTimeEnd"
                  inputName="eventRegTimeEnd"
                  label="Tidspunkt frist"
                  errorMessage="Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato."
                  handleChange={updateRegEndTime}
                  valid={validRegEnd}
                  initiallyFocused
                  noExtraInfo
                  card
                />
              </div>
            </>
          )}
        </>
      }
    >
      <div className={`${styles.horizontalContainer}`}>
        <div className={`${styles.diagonalContainer} `}>
          <span
            className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
          >
            Start:{" "}
          </span>
          {eventObject.endDate && (
            <span
              className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
            >
              Slutt:{" "}
            </span>
          )}
          {eventObject.regStart && (
            <span
              className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
            >
              Påmelding åpner:
            </span>
          )}
          {eventObject.regEnd && (
            <span
              className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
            >
              Påmelding stenger:
            </span>
          )}
        </div>

        <div className={`${styles.diagonalContainer} ${styles.startAlign}`}>
          <TimeView
            ISOtime={tempEventObject.startDate}
            styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
            localTime={false}
          ></TimeView>
          {tempEventObject.endDate && (
            <TimeView
              ISOtime={tempEventObject.endDate}
              styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
              localTime={false}
            ></TimeView>
          )}
          {tempEventObject.regStart && (
            <TimeView
              ISOtime={tempEventObject.regStart}
              styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
              localTime={false}
            ></TimeView>
          )}
          {tempEventObject.regEnd && (
            <TimeView
              ISOtime={tempEventObject.regEnd}
              styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
              localTime={false}
            ></TimeView>
          )}
        </div>
      </div>
    </SummaryCard>
  );
};

export default EditDateTimeSection;
