interface CalendarIconProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
}

const CalendarIcon = ({ width, height, strokeWidth }: CalendarIconProps) => {
  return (
    <svg
      width={width ? `${width}` : "22"}
      height={height ? `${height}` : "22"}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="11" fill="#594F78" />
      <path
        d="M15.0833 6.33333H6.91667C6.27233 6.33333 5.75 6.85566 5.75 7.49999V15.6667C5.75 16.311 6.27233 16.8333 6.91667 16.8333H15.0833C15.7277 16.8333 16.25 16.311 16.25 15.6667V7.49999C16.25 6.85566 15.7277 6.33333 15.0833 6.33333Z"
        stroke="#B89BFE"
        strokeWidth={strokeWidth ? `${strokeWidth}` : "1"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3333 5.16667V7.50001"
        stroke="#B89BFE"
        strokeWidth={strokeWidth ? `${strokeWidth}` : "1"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.66667 5.16667V7.50001"
        stroke="#B89BFE"
        strokeWidth={strokeWidth ? `${strokeWidth}` : "1"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 9.83333H16.25"
        stroke="#B89BFE"
        strokeWidth={strokeWidth ? `${strokeWidth}` : "1"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CalendarIcon;
