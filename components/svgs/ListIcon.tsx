import Icon, { type IconShapeProps } from "./Icon";

const ListIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 6H21" />
    <path d="M8 12H21" />
    <path d="M8 18H21" />
    <path d="M3 6H3.01" />
    <path d="M3 12H3.01" />
    <path d="M3 18H3.01" />
  </Icon>
);

export default ListIcon;
