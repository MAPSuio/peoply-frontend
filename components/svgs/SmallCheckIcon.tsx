interface SmallCheckIconProps {
  width?: number;
  height?: number;
}

export default function SmallCheckIcon({ width, height }: SmallCheckIconProps) {
  return (
    <svg
      width={width ? width : "14"}
      height={height ? height : "14"}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.6667 3.5L5.25004 9.91667L2.33337 7"
        stroke="#7EFB8E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
