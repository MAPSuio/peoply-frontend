interface CheckIconProps {
  className?: string;
}

export default function CheckIcon({ className }: CheckIconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "flex" }}
    >
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
    </svg>
  );
}
