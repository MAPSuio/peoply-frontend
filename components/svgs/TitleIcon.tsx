import Icon, { type IconShapeProps } from "./Icon";

const TitleIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 7V4H20V7" />
    <path d="M9 20H15" />
    <path d="M12 4V20" />
  </Icon>
);

export default TitleIcon;
