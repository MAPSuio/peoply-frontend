import Icon, { type IconShapeProps } from "./Icon";

const LogoutIcon = (props: IconShapeProps) => (
  <Icon
    viewBox="0 0 16 16"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 15.4286H3.33333C2.97971 15.4286 2.64057 15.2881 2.39052 15.038C2.14048 14.788 2 14.4489 2 14.0952V4.76191C2 4.40828 2.14048 4.06915 2.39052 3.8191C2.64057 3.56905 2.97971 3.42857 3.33333 3.42857H6" />
    <path d="M10.6665 13.5238L13.9998 10.1905L10.6665 6.85715" />
    <path d="M14 10.2857H6" />
  </Icon>
);

export default LogoutIcon;
