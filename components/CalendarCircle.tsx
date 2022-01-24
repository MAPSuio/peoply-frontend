import CalendarIcon from "./svgs/CalendarIcon";

interface CalendarCircleProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const CalendarCircle = ({
  width,
  height,
  strokeWidth,
}: CalendarCircleProps) => {
  return (
    <CalendarIcon width={width} height={height} strokeWidth={strokeWidth} />
  );
};

export default CalendarCircle;
