import Icon, { type IconShapeProps } from "./Icon";

const MailIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 16 16"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.66683 2.66666H13.3335C14.0668 2.66666 14.6668 3.26666 14.6668 4V12C14.6668 12.7333 14.0668 13.3333 13.3335 13.3333H2.66683C1.9335 13.3333 1.3335 12.7333 1.3335 12V4C1.3335 3.26666 1.9335 2.66666 2.66683 2.66666Z" />
    <path d="M14.6668 4L8.00016 8.66667L1.3335 4" />
  </Icon>
);

export default MailIcon;
