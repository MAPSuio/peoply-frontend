interface WarningIconProps {
  className?: string;
}

const WarningIcon = ({ className }: WarningIconProps) => {
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
        d="M6.00251 2.25166L1.06168 10.5C0.95981 10.6764 0.905909 10.8764 0.905339 11.0801C0.904769 11.2838 0.957548 11.4842 1.05843 11.6611C1.15931 11.8381 1.30477 11.9856 1.48034 12.0889C1.65591 12.1922 1.85548 12.2478 2.05918 12.25H11.9408C12.1445 12.2478 12.3441 12.1922 12.5197 12.0889C12.6953 11.9856 12.8407 11.8381 12.9416 11.6611C13.0425 11.4842 13.0953 11.2838 13.0947 11.0801C13.0941 10.8764 13.0402 10.6764 12.9383 10.5L7.99751 2.25166C7.89352 2.08023 7.7471 1.93848 7.57238 1.84011C7.39765 1.74174 7.20052 1.69006 7.00001 1.69006C6.7995 1.69006 6.60237 1.74174 6.42765 1.84011C6.25292 1.93848 6.1065 2.08023 6.00251 2.25166V2.25166Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 5.25V7.58333" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M7 9.91666H7.00583"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default WarningIcon;
