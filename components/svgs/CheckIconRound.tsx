interface CheckIconRoundProps {
  className?: string;
}

const CheckIconRound = ({ className }: CheckIconRoundProps) => {
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
        d="M12.8333 6.46334V7C12.8326 8.25792 12.4253 9.4819 11.6721 10.4894C10.9189 11.4969 9.86024 12.234 8.65395 12.5906C7.44766 12.9473 6.15839 12.9044 4.97843 12.4685C3.79847 12.0326 2.79104 11.2269 2.10638 10.1716C1.42173 9.11636 1.09653 7.86804 1.1793 6.61285C1.26207 5.35767 1.74836 4.16286 2.56565 3.20663C3.38295 2.2504 4.48745 1.58398 5.71443 1.30675C6.94142 1.02953 8.22515 1.15637 9.37416 1.66834"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.8333 2.33333L7 8.1725L5.25 6.4225"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CheckIconRound;
