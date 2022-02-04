interface PublicIconSmallProps {
  className?: string;
}

const PublicIconSmall = ({ className }: PublicIconSmallProps) => {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.583374 7.00001C0.583374 7.00001 2.91671 2.33334 7.00004 2.33334C11.0834 2.33334 13.4167 7.00001 13.4167 7.00001C13.4167 7.00001 11.0834 11.6667 7.00004 11.6667C2.91671 11.6667 0.583374 7.00001 0.583374 7.00001Z"
        stroke="#B89BFE"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 8.75C7.9665 8.75 8.75 7.9665 8.75 7C8.75 6.0335 7.9665 5.25 7 5.25C6.0335 5.25 5.25 6.0335 5.25 7C5.25 7.9665 6.0335 8.75 7 8.75Z"
        stroke="#B89BFE"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PublicIconSmall;
