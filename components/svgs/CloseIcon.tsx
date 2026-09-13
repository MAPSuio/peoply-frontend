import Icon, { type IconShapeProps } from "./Icon";

const CloseIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 4L4 12" />
    <path d="M4 4L12 12" />
  </Icon>
);

export default CloseIcon;
