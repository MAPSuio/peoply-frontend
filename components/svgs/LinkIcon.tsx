import Icon, { type IconShapeProps } from "./Icon";

const LinkIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4.08337 9.91665L9.91671 4.08331" />
    <path d="M4.08337 4.08331H9.91671V9.91665" />
  </Icon>
);

export default LinkIcon;
