import Icon, { type IconShapeProps } from "./Icon";

const FlagIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 21V4" />
    <path d="M5 5H14.5L13 8L14.5 11H5" />
  </Icon>
);

export default FlagIcon;
