import Icon, { type IconShapeProps } from "./Icon";

const PlusIconNav = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 5V19" />
    <path d="M5 12H19" />
  </Icon>
);

export default PlusIconNav;
