interface TimeViewProps {
  ISOtime: string; // time in ISO format (yyyy-mm-ddThh:mm:ss.sssZ)
  styles?: string;
  localTime?: boolean;
}

export default function TimeView({
  ISOtime,
  styles,
  localTime = true,
}: TimeViewProps) {
  const dateObj = new Date(ISOtime);
  const timeObj = new Date(ISOtime);

  let date = dateObj.toLocaleDateString();
  let time = timeObj.toLocaleTimeString();

  if (!localTime) {
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const UTCDate = new Date(dateObj.getTime() + timezoneOffset);
    date = UTCDate.toLocaleDateString();
    time = UTCDate.toLocaleTimeString();
  }

  return (
    <p className={`${styles}`}>
      {date}, {time}
    </p>
  );
}
