import Icon, { type IconShapeProps } from "./Icon";

const GridLargeIcon = (props: IconShapeProps) => (
  <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="3" y="3" width="8" height="8" rx="1.5"></rect>
    <rect x="13" y="3" width="8" height="8" rx="1.5"></rect>
    <rect x="3" y="13" width="8" height="8" rx="1.5"></rect>
    <rect x="13" y="13" width="8" height="8" rx="1.5"></rect>
  </Icon>
);

export default GridLargeIcon;
