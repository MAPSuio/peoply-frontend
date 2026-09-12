import Icon, { type IconShapeProps } from "./Icon";

const SmallCheckIcon = ({ strokeWidth = "2", ...props }: IconShapeProps) => (
  <Icon
    viewBox="0 0 14 14"
    fill="none"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11.6667 3.5L5.25004 9.91667L2.33337 7" />
  </Icon>
);

export default SmallCheckIcon;
