import Icon, { type IconShapeProps } from "./Icon";

const ChevronRightIcon = (props: IconShapeProps) => (
  <Icon viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M6 12L10 8L6 4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default ChevronRightIcon;
