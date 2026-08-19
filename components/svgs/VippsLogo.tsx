interface VippsLogoProps {
  className?: string;
}

/* The Vipps smile on its brand orange, simplified to read at icon size. */
const VippsLogo = ({ className }: VippsLogoProps) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="6" fill="#ff5b24" />
      <circle cx="16.2" cy="7.4" r="2.1" fill="#ffffff" />
      <path
        d="M6 10.5c1.6 4.6 7 5.6 10.4 1.1"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default VippsLogo;
