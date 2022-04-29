// Components.
import LoadingWheel from "./LoadingWheel";

// Types.
import { ButtonType } from "../types/types";

// Styles.
import styles from "../styles/Button.module.scss";

interface ButtonProps {
  text: string;
  type?: ButtonType;
  onClick?: (e: any) => void;
  className?: string;
  disabled?: boolean;
  isLink?: boolean;
  small?: boolean;
  noShadow?: boolean;
  loading?: boolean;
}

export default function Button({
  text,
  type,
  onClick,
  className,
  disabled,
  isLink,
  small,
  noShadow,
  loading,
}: ButtonProps) {
  const buttonStyles = (() => {
    switch (type) {
      case ButtonType.PRIMARY:
        return `${styles.button} ${small && styles.small} ${
          noShadow && styles.noShadow
        }`;
      case ButtonType.SECONDARY:
        return `${styles.button} ${styles.secondaryButton} ${
          small && styles.small
        } ${noShadow && styles.noShadow}`;
      case ButtonType.DANGER:
        return `${styles.button} ${styles.dangerButton} ${
          small && styles.small
        } ${noShadow && styles.noShadow}`;
      case ButtonType.WARNING:
        return `${styles.button} ${styles.warningButton} ${
          small && styles.small
        } ${noShadow && styles.noShadow}`;
      default:
        return `${styles.button} ${small && styles.small} ${
          noShadow && styles.noShadow
        }`;
    }
  })();

  if (isLink) {
    return (
      <a className={styles.buttonContainer}>
        <button
          onClick={onClick}
          className={`${buttonStyles} ${className}`}
          disabled={disabled}
        >
          {loading ? (
            <LoadingWheel
              dark={type === ButtonType.WARNING || type === ButtonType.DANGER}
            />
          ) : (
            text
          )}
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
      {loading ? (
        <LoadingWheel
          dark={type === ButtonType.WARNING || type === ButtonType.DANGER}
        />
      ) : (
        text
      )}
    </button>
  );
}
