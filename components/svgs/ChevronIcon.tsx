import Icon, { type IconShapeProps } from "./Icon";

const ChevronIcon = (props: IconShapeProps) => (
  <Icon viewBox="0 0 8 14" fill="none" {...props}>
    <path
      d="M7 13L1 7L7 1"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default ChevronIcon;
