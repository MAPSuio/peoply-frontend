import Icon, { type IconShapeProps } from "./Icon";

/* The Vipps smile on its brand orange, simplified to read at icon size. */
const VippsLogo = (props: IconShapeProps) => (
  <Icon viewBox="0 0 24 24" aria-hidden="true" fill="none" {...props}>
    <rect width="24" height="24" rx="6" fill="#ff5b24" />
    <circle cx="16.2" cy="7.4" r="2.1" fill="#ffffff" />
    <path
      d="M6 10.5c1.6 4.6 7 5.6 10.4 1.1"
      stroke="#ffffff"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  </Icon>
);

export default VippsLogo;
