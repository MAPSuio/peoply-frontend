import Icon, { type IconShapeProps } from "./Icon";

const PlusIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 2.91669V11.0834" />
    <path d="M2.91669 7H11.0834" />
  </Icon>
);

export default PlusIcon;
