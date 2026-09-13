const ISO_DATE_LENGTH = 10;

export function withDatePart(isoString: string, date: string): string {
  return date + isoString.substring(ISO_DATE_LENGTH);
}

export function withTimePart(isoString: string, time: string): string {
  return `${isoString.substring(0, ISO_DATE_LENGTH)}T${time}:00.000Z`;
}
