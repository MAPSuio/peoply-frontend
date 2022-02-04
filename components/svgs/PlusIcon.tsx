interface PlusIconProps {
  className?: string;
}

const PlusIcon = ({ className }: PlusIconProps) => {
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
        d="M7 2.91669V11.0834"
        stroke="#B89BFE"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.91669 7H11.0834"
        stroke="#B89BFE"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PlusIcon;
