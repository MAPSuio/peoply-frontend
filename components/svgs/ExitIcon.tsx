import Icon, { type IconShapeProps } from "./Icon";

const ExitIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6L6 18" />
    <path d="M6 6L18 18" />
  </Icon>
);

export default ExitIcon;
