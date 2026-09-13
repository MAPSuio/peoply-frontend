import Icon, { type IconShapeProps } from "./Icon";

const ChevronLeftIcon = (props: IconShapeProps) => (
  <Icon viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M15 18L9 12L15 6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export default ChevronLeftIcon;
