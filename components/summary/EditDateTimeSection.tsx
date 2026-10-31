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
import type { EventObjectProps, PatchDateTime } from "../EditSummaryPage";

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
  patchDateTime: PatchDateTime;
}

type OptionalDateTimeField = "endDate" | "regStart" | "regEnd";

interface OptionalDateTimeProps {
  field: OptionalDateTimeField;
  label: string;
  ids: [string, string];
  names: [string, string];
  labels: [string, string];
  errors: [string, string];
  valid: boolean;
  setValid: Dispatch<SetStateAction<boolean>>;
  tempEventObject: EventObjectProps;
  setTempEventObject: Dispatch<SetStateAction<EventObjectProps>>;
  patchDateTime: PatchDateTime;
}

const OptionalDateTime = ({
  field,
  label,
  ids,
  names,
  labels,
  errors,
  valid,
  setValid,
  tempEventObject,
  setTempEventObject,
  patchDateTime,
}: OptionalDateTimeProps) => {
  const value = tempEventObject[field];

  if (!value) {
    return (
      <button
        type="button"
        className={styles.addDateContainer}
        onClick={() =>
          setTempEventObject({
            ...tempEventObject,
            [field]: tempEventObject.startDate,
          })
        }
      >
        <PlusIcon className={styles.addDateIcon} />
        <p className={styles.addDateText}>{label}</p>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.addDateContainer}
        onClick={() => {
          setTempEventObject({ ...tempEventObject, [field]: undefined });
          setValid(true);
        }}
      >
        <MinusIcon
          className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
        />
        <p className={styles.addDateText}>{label}</p>
      </button>
      <div className={`${styles.horizontalContainer} `}>
        <DateInput
          value={getISODateString(value)}
          inputId={ids[0]}
          inputName={names[0]}
          label={labels[0]}
          errorMessage={errors[0]}
          handleChange={patchDateTime(field, "date")}
          valid={valid}
          initiallyFocused
          noExtraInfo
          card
        />
        <TimeInput
          value={getISOTimeString(value)}
          inputId={ids[1]}
          inputName={names[1]}
          label={labels[1]}
          errorMessage={errors[1]}
          handleChange={patchDateTime(field, "time")}
          valid={valid}
          initiallyFocused
          noExtraInfo
          card
        />
      </div>
    </>
  );
};

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
  patchDateTime,
}: EditDateTimeSectionProps) => {
  const shared = { tempEventObject, setTempEventObject, patchDateTime };

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
              handleChange={patchDateTime("startDate", "date")}
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
              handleChange={patchDateTime("startDate", "time")}
              valid={validStart}
              noExtraInfo
              card
            />
          </div>
          <OptionalDateTime
            field="endDate"
            label="Sluttdato og -tidspunkt"
            ids={["dateEnd", "timeEnd"]}
            names={["eventDateEnd", "eventTimeEnd"]}
            labels={["Dato slutt", "Tidspunkt slutt"]}
            errors={[
              "Sluttdato kan ikke være før startdato.",
              "Sluttidspunkt kan ikke være før starttidspunkt.",
            ]}
            valid={validEnd}
            setValid={setValidEnd}
            {...shared}
          />
          <OptionalDateTime
            field="regStart"
            label="Påmelding åpner"
            ids={["regDateStart", "regTimeStart"]}
            names={["eventRegDateStart", "eventRegTimeStart"]}
            labels={["Dato åpning", "Tidspunkt åpning"]}
            errors={[
              "Påmelding må åpne før startdato.",
              "Påmelding må åpne før startdato.",
            ]}
            valid={validRegStart}
            setValid={setValidRegStart}
            {...shared}
          />
          <OptionalDateTime
            field="regEnd"
            label="Påmelding stenger"
            ids={["regDateEnd", "regTimeEnd"]}
            names={["eventRegDateEnd", "eventRegTimeEnd"]}
            labels={["Dato frist", "Tidspunkt frist"]}
            errors={[
              "Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato.",
              "Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato.",
            ]}
            valid={validRegEnd}
            setValid={setValidRegEnd}
            {...shared}
          />
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
