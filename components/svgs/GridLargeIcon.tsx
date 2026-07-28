interface GridLargeIconProps {
  className?: string;
}

export default function GridLargeIcon({ className }: GridLargeIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="3" y="3" width="8" height="8" rx="1.5"></rect>
      <rect x="13" y="3" width="8" height="8" rx="1.5"></rect>
      <rect x="3" y="13" width="8" height="8" rx="1.5"></rect>
      <rect x="13" y="13" width="8" height="8" rx="1.5"></rect>
    </svg>
  );
}
