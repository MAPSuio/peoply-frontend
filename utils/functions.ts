import { InputPages, CircleLabels, Weekdays } from "../types/types";

function formatDateRange(startDate: Date, endDate: Date | null): string {
  let dateString: string;
  // if start date, month and year is today
  if (
    startDate.getDate() === new Date().getDate() &&
    startDate.getMonth() === new Date().getMonth() &&
    startDate.getFullYear() === new Date().getFullYear()
  ) {
    dateString = `I dag`;
  } else if (endDate && startDate.getFullYear() !== endDate.getFullYear()) {
    dateString = `${startDate.getDate()}. ${startDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${startDate.getFullYear()}-${endDate.getDate()}. ${endDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${endDate.getFullYear()}`;
  } else if (endDate && startDate.getMonth() !== endDate.getMonth()) {
    dateString = `${startDate.getDate()}. ${startDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )}–${endDate.getDate()}. ${endDate.toLocaleString("default", {
      month: "short",
    })} ${endDate.getFullYear()}`;
  } else if (endDate && startDate.getDate() !== endDate.getDate()) {
    dateString = `${startDate.getDate()}–${endDate.getDate()}. ${endDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${endDate.getFullYear()}`;
  } else {
    dateString = `${startDate.getDate()}. ${startDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${startDate.getFullYear()}`;
  }
  return dateString;
}

function formatTimeRange(startDate: Date, endDate: Date | null): string {
  if (
    startDate.getDate() === endDate?.getDate() &&
    startDate.getMonth() === endDate?.getMonth() &&
    startDate.getFullYear() === endDate?.getFullYear() &&
    startDate.getHours() === endDate?.getHours() &&
    startDate.getMinutes() === endDate?.getMinutes()
  ) {
    return `${startDate.toLocaleString("default", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (
    startDate.getDate() === endDate?.getDate() &&
    startDate.getMonth() === endDate?.getMonth() &&
    startDate.getFullYear() === endDate?.getFullYear()
  ) {
    return `${startDate.toLocaleString("default", {
      hour: "2-digit",
      minute: "2-digit",
    })}–${endDate.toLocaleString("default", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  const timeString = `${startDate.toLocaleString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })}${
    endDate
      ? `–${endDate.toLocaleString("default", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : ""
  }`;
  return timeString;
}

// Checks if the supplied date is older than today's date (valid).
function olderThanToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  date.setHours(0, 0, 0, 0);

  return today <= date;
}

/* Checks if a given end date is older than a given start date. */
function olderThanStart(dateStart: Date, dateEnd: Date): boolean {
  dateStart.setHours(0, 0, 0, 0);
  dateEnd.setHours(0, 0, 0, 0);

  return dateEnd >= dateStart;
}

/* Checks if two dates are the same. */
function sameDate(dateOne: Date, dateTwo: Date): boolean {
  dateOne.setHours(0, 0, 0, 0);
  dateTwo.setHours(0, 0, 0, 0);

  return dateOne === dateTwo;
}

/* Formats a date into yyyy-mm-dd. */
function getISODate(date: Date): string {
  const isoString = date.toISOString().slice(0, 10);

  return isoString;
}

/* Formats a date(time) into hh:mm:ss. */
function getISOTime(date: Date): string {
  const isoString = date.toLocaleTimeString().slice(0, -3);

  return isoString;
}

/* Formats a date into dd.mm.yyyy. */
function getDateString(date: string): string {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  const day = date.slice(8, 10);

  return `${day}.${month}.${year}`;
}

/* Gets the weekday of a given date. */
function getWeekday(date: Date): string {
  const day = date.getDay();

  switch (day) {
    case 0:
      return Weekdays.SUNDAY;
    case 1:
      return Weekdays.MONDAY;
    case 2:
      return Weekdays.TUESDAY;
    case 3:
      return Weekdays.WEDNESDAY;
    case 4:
      return Weekdays.THURSDAY;
    case 5:
      return Weekdays.FRIDAY;
    case 6:
      return Weekdays.SATURDAY;
    default:
      return "Whatever day";
  }
}

/* Formats a date (yyyy-mm-dd) and time (hh:mm) into an ISO date. */
function formatDateAndTime(date: string, time: string) {
  const hours = parseInt(time.slice(0, 3));
  const minutes = parseInt(time.slice(3));
  const dateWithTime = new Date(date);

  dateWithTime.setHours(hours, minutes, 0, 0);

  return dateWithTime.toISOString();
}

/* Checks if a given time and date is later than the current time (valid). */
function laterThanNow(date: string, timeStamp: string): boolean {
  const hours = parseInt(timeStamp.slice(0, 3));
  const minutes = parseInt(timeStamp.slice(3));
  const timeStampWithDate = new Date(date);
  const today = new Date();

  today.setSeconds(0);
  today.setMilliseconds(0);
  timeStampWithDate.setHours(hours, minutes, 0, 0);

  return timeStampWithDate >= today;
}

/* Checks if the end date is later than the start date.
TODO: Make this more general?  */
function laterThanStart(
  timeStampStart: string,
  timeStampEnd: string,
  dateStart: string,
  dateEnd: string,
) {
  const hoursStart = parseInt(timeStampStart.slice(0, 3));
  const minutesStart = parseInt(timeStampStart.slice(3));
  const timeStampStartWithDate = new Date(dateStart);

  const hoursEnd = parseInt(timeStampEnd.slice(0, 3));
  const minutesEnd = parseInt(timeStampEnd.slice(3));
  const timeStampEndWithDate = new Date(dateEnd);

  timeStampStartWithDate.setHours(hoursStart, minutesStart, 0, 0);
  timeStampEndWithDate.setHours(hoursEnd, minutesEnd, 0, 0);

  return timeStampEndWithDate >= timeStampStartWithDate;
}

function arrayFromRange(size: number): Array<number> {
  return Array.from(Array(size).keys());
}

/* Get the correct title, sub title, and button text for a given step in the
create event flow. */
function getInputPageData(step: number): {
  title: string;
  subTitle: string;
  buttonText: string;
} {
  switch (step) {
    case 0:
      return {
        title: "Opprett nytt arrangement",
        subTitle: "Hva vil du kalle arrangementet ditt for?",
        buttonText: "Gå til dato og tidspunkt",
      };
    case 1:
      return {
        title: "Dato og tidspunkt",
        subTitle: "Når skal arrangementet ditt finne sted?",
        buttonText: "Gå til adresse/sted",
      };
    case 2:
      return {
        title: "Adresse/sted",
        subTitle: "Hvor skal arrangementet finne sted?",
        buttonText: "Gå til beskrivelse",
      };
    case 3:
      return {
        title: "Beskrivelse og kategorier",
        subTitle: "Hva slags arrangementet er det snakk om?",
        buttonText: "Gå til bildeopplasting",
      };
    case 4:
      return {
        title: "Arrangementbilde",
        subTitle:
          "Hvis du ikke har et eget bilde, bruker vi et fra biblioteket vårt.",
        buttonText: "Gå til øvrig informasjon",
      };
    case 5:
      return {
        title: "Øvrig informasjon",
        subTitle: "Er det noe mer vi trenger å vite?",
        buttonText: "Gå til oppsummering",
      };
    case 6:
      return {
        title: "Ditt arrangement",
        subTitle: "Ser alt riktig ut?",
        buttonText: "Opprett arrangement",
      };
    default:
      return {
        title: "Opprett nytt arrangement",
        subTitle: "Hva vil du kalle arrangementet ditt for?",
        buttonText: "Gå til dato og tidspunkt",
      };
  }
}

/* Get the name of the input page at a given step in the flow. */
function getInputPageName(step: number): string {
  switch (step) {
    case 0:
      return InputPages.TITLEPAGE;
    case 1:
      return InputPages.DATEPAGE;
    case 2:
      return InputPages.ADDRESSPAGE;
    case 3:
      return InputPages.DESCRIPTIONPAGE;
    case 4:
      return InputPages.IMAGEPAGE;
    case 5:
      return InputPages.EXTRAINFOPAGE;
    case 6:
      return InputPages.SUMMARYPAGE;
    default:
      return InputPages.TITLEPAGE;
  }
}

/* Get the label of a given progress circle. */
function getProgressCircleLabel(step: number): string {
  switch (step) {
    case 0:
      return CircleLabels.TITLE;
    case 1:
      return CircleLabels.DATE;
    case 2:
      return CircleLabels.LOCATION;
    case 3:
      return CircleLabels.DESCRIPTION;
    case 4:
      return CircleLabels.IMAGE;
    case 5:
      return CircleLabels.EXTRA;
    case 6:
      return CircleLabels.SUMMARY;
    default:
      return "There is no default";
  }
}

/* Gets the text for a category with the given ID. */
function getCategoryText(
  categories: Array<{ id: number; name: string }>,
  id: number,
): string {
  const category = categories.find((cat) => cat.id === id);

  return category?.name || "";
}

/* Checks if a text input is valid. */
function textInputValid(
  text: string,
  minLength: number,
  maxLength: number,
): boolean {
  return text.length > minLength && text.length <= maxLength;
}

/* Checks if a number input is valid. */
function numberInputValid(number: number, min: number, max: number): boolean {
  return number > min && number <= max;
}

/* Checks if given start date is valid.  */
function dateInputStartValid(dateString: string): boolean {
  return olderThanToday(new Date(dateString));
}

/* Checks if a given end date is valid. */
function dateInputEndValid(
  dateStringStart: string,
  dateStringEnd: string,
): boolean {
  const dateEndvalid = olderThanStart(
    new Date(dateStringStart),
    new Date(dateStringEnd),
  );

  return dateEndvalid;
}

/* Checks if a given start time is valid. */
function timeInputStartValid(timeString: string, dateString: string): boolean {
  return laterThanNow(dateString, timeString);
}

/* Checks if a given end time is valid. */
function timeInputEndValid(
  timeStringStart: string,
  timeStringEnd: string,
  dateStringStart: string,
  dateStringEnd: string,
): boolean {
  const timeLaterThanDate = laterThanNow(dateStringEnd, timeStringEnd);
  const dateLaterThanStart = laterThanStart(
    timeStringStart,
    timeStringEnd,
    dateStringStart,
    dateStringEnd,
  );

  return timeLaterThanDate && dateLaterThanStart;
}

/* Checks if a category input is valid. */
function categoryInputValid(categories: Array<number>): boolean {
  return categories.length > 0;
}

/* Checks if a radio input is valid. */
function radioInputValid(
  numberInputRequired: boolean,
  number: number,
  min: number,
  max: number,
): boolean {
  if (numberInputRequired) {
    return numberInputValid(number, min, max);
  } else {
    return true;
  }
}

/* Checks if an image input is valid. */
function imageInputValid(image: File | null): boolean {
  return image !== null;
}

/* Checks if an event has all valid data. */
function allEventInputsValid(eventInputsValid: Array<boolean>): boolean {
  const valid = eventInputsValid.every((eventInput) => {
    return eventInput;
  });

  return valid;
}

export {
  formatDateRange,
  formatTimeRange,
  olderThanToday,
  getISODate,
  getISOTime,
  formatDateAndTime,
  laterThanNow,
  arrayFromRange,
  getInputPageData,
  textInputValid,
  numberInputValid,
  dateInputStartValid,
  dateInputEndValid,
  timeInputStartValid,
  timeInputEndValid,
  categoryInputValid,
  radioInputValid,
  imageInputValid,
  sameDate,
  allEventInputsValid,
  getDateString,
  getCategoryText,
  getInputPageName,
  getProgressCircleLabel,
  olderThanStart,
  getWeekday,
};
