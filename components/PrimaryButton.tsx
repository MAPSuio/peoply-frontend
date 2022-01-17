import styles from "../styles/PrimaryButton.module.scss";

interface PrimaryButtonProps {
  onClick?: () => void;
  text: string;
  className: string;
  isLink?: boolean;
}

export default function PrimaryButton({
  onClick,
  text,
  className,
  isLink,
}: PrimaryButtonProps) {
  if (isLink) {
    return (
      <a className={styles.buttonContainer}>
        <button onClick={onClick} className={`${styles.button} ${className}`}>
          {text}
        </button>
      </a>
    );
  }
  return (
    <button onClick={onClick} className={`${styles.button} ${className}`}>
      {text}
    </button>
  );
}
