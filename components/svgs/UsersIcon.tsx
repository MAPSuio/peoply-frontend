interface UsersIconProps {
  className?: string;
}

const UsersIcon = ({ className }: UsersIconProps) => {
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
        d="M9.91667 12.25V11.0833C9.91667 10.4645 9.67084 9.871 9.23325 9.43342C8.79567 8.99583 8.20217 8.75 7.58334 8.75H2.91667C2.29783 8.75 1.70434 8.99583 1.26675 9.43342C0.829169 9.871 0.583336 10.4645 0.583336 11.0833V12.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 6.41667C6.53866 6.41667 7.58333 5.372 7.58333 4.08333C7.58333 2.79467 6.53866 1.75 5.25 1.75C3.96133 1.75 2.91666 2.79467 2.91666 4.08333C2.91666 5.372 3.96133 6.41667 5.25 6.41667Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.4167 12.25V11.0833C13.4163 10.5663 13.2442 10.0641 12.9275 9.65552C12.6107 9.24692 12.1672 8.95508 11.6667 8.82583"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33334 1.82583C9.83524 1.95434 10.2801 2.24624 10.5978 2.65552C10.9155 3.06479 11.0879 3.56815 11.0879 4.08625C11.0879 4.60435 10.9155 5.10771 10.5978 5.51699C10.2801 5.92626 9.83524 6.21816 9.33334 6.34667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UsersIcon;
