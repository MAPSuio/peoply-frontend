import Icon, { type IconShapeProps } from "./Icon";

const InfoIconSummary = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <path d="M12 16V12" />
    <path d="M12 8H12.01" />
  </Icon>
);

export default InfoIconSummary;
