function formatDateRange(startDate: Date, endDate: Date) {
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

function formatTimeRange(startDate: Date, endDate: Date) {
  const timeString = `${startDate.toLocaleString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${endDate.toLocaleString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  return timeString;
}

export { formatDateRange, formatTimeRange };
