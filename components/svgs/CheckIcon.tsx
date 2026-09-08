import Icon, { type IconShapeProps } from "./Icon";

const CheckIcon = (props: IconShapeProps) => (
  <Icon viewBox="0 0 24 24" fill="none" style={{ display: "flex" }} {...props}>
    <svg id="pathWrapper" style={{ position: "relative" }}>
      <path
        d="M22.6667 1L8.00004 15.6667L1.33337 9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ justifyContent: "center" }}
        transform="translate(0 4)" //move the icon down 4px
      />
    </svg>
  </Icon>
);

export default CheckIcon;
