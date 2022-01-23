function formatDateRange(startDate: Date, endDate: Date): string {
  let dateString: string;
  // if start date, month and year is today
  if (
    startDate.getDate() === new Date().getDate() &&
    startDate.getMonth() === new Date().getMonth() &&
    startDate.getFullYear() === new Date().getFullYear()
  ) {
    dateString = `I dag`;
  } else if (startDate.getFullYear() !== endDate.getFullYear()) {
    dateString = `${startDate.getDate()}. ${startDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${startDate.getFullYear()} - ${endDate.getDate()}. ${endDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${endDate.getFullYear()}`;
  } else if (startDate.getMonth() !== endDate.getMonth()) {
    dateString = `${startDate.getDate()}. ${startDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} - ${endDate.getDate()}. ${endDate.toLocaleString("default", {
      month: "short",
    })} ${endDate.getFullYear()}`;
  } else if (startDate.getDate() !== endDate.getDate()) {
    dateString = `${startDate.getDate()}. - ${endDate.getDate()}. ${endDate.toLocaleString(
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

function formatTimeRange(startDate: Date, endDate: Date): string {
  const timeString = `${startDate.toLocaleString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${endDate.toLocaleString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  return timeString;
}

// Checks if the supplied date is older than today's date (valid).
function olderThanToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  date.setHours(0, 0, 0, 0);

  return today <= date;
}

// Formats a date into yyyy-mm-dd.
function getISODate(date: Date): string {
  const isoString = date.toISOString().slice(0, 10);

  return isoString;
}

// Formats a date(time) into hh:mm:ss.
function getISOTime(date: Date): string {
  const isoString = date.toLocaleTimeString().slice(0, -3);

  return isoString;
}

// Checks if a given time and date is later than the current time (valid).
function laterThanNow(date: string, timeStamp: string): boolean {
  const hours = parseInt(timeStamp.slice(0, 3));
  const minutes = parseInt(timeStamp.slice(3));
  const dateStampWithDate = new Date(date);
  const today = new Date();

  today.setSeconds(0);
  today.setMilliseconds(0);
  dateStampWithDate.setHours(hours, minutes, 0, 0);

  return dateStampWithDate >= today;
}

function arrayFromRange(size: number): Array<number> {
  return Array.from(Array(size).keys());
}

export {
  formatDateRange,
  formatTimeRange,
  olderThanToday,
  getISODate,
  getISOTime,
  laterThanNow,
  arrayFromRange,
};
