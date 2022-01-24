import styles from "../styles/PrimaryButton.module.scss";

interface PrimaryButtonProps {
  onClick?: () => void;
  text: string;
  className: string;
  disabled?: boolean;
  isLink?: boolean;
}

export default function PrimaryButton({
  onClick,
  text,
  className,
  disabled,
  isLink,
}: PrimaryButtonProps) {
  if (isLink) {
    return (
      <a className={styles.buttonContainer}>
        <button
          onClick={onClick}
          className={`${styles.button} ${className}`}
          disabled={disabled}
        >
          {text}
        </button>
      </a>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
