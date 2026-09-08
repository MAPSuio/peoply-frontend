import Icon, { type IconShapeProps } from "./Icon";

const TimeIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 14 14"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7.00001 12.8333C10.2217 12.8333 12.8333 10.2217 12.8333 7C12.8333 3.77834 10.2217 1.16667 7.00001 1.16667C3.77834 1.16667 1.16667 3.77834 1.16667 7C1.16667 10.2217 3.77834 12.8333 7.00001 12.8333Z" />
    <path d="M7 3.5V7L9.33333 8.16667" />
  </Icon>
);

export default TimeIcon;
