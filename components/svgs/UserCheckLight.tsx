import Icon, { type IconShapeProps } from "./Icon";

const UserCheckLight = ({ style, ...props }: IconShapeProps) => (
  <Icon
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    style={{ marginLeft: "8px", ...style }}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline stroke="#007F25" points="17 11 19 13 23 9"></polyline>
  </Icon>
);

export default UserCheckLight;
