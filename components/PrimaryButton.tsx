import styles from "../styles/PrimaryButton.module.scss";

interface PrimaryButtonProps {
  onClick?: (e: any) => void;
  text: string;
  className?: string;
  disabled?: boolean;
  isLink?: boolean;
  small?: boolean;
}

export default function PrimaryButton({
  onClick,
  text,
  className,
  disabled,
  isLink,
  small,
}: PrimaryButtonProps) {
  const buttonStyles = small
    ? `${styles.button} ${styles.small}`
    : styles.button;

  if (isLink) {
    return (
      <a className={styles.buttonContainer}>
        <button
          onClick={onClick}
          className={`${buttonStyles} ${className}`}
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
      className={`${buttonStyles} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
}
