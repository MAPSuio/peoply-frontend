import Icon, { type IconShapeProps } from "./Icon";

const ApiIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 20 20"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7.08333 13.3333L3.75 10L7.08333 6.66667" />
    <path d="M12.9167 6.66667L16.25 10L12.9167 13.3333" />
    <path d="M11.25 4.16667L8.75 15.8333" />
  </Icon>
);

export default ApiIcon;
