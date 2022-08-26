// Components.
// Types.
import { ButtonType } from "../types/types";

// Styles.
import styles from "../styles/Button.module.scss";
import Link from "next/link";

interface LinkButtonProps {
  text: string;
  href: string;
  type?: ButtonType;
  className?: string;
  small?: boolean;
  width?: string;
  noShadow?: boolean;
}

export default function LinkButton({
  text,
  href,
  type,
  className,
  small,
  width,
  noShadow,
}: LinkButtonProps) {
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

  return (
    <Link href={href} passHref>
      <a className={`${buttonStyles} ${className}`} style={{ width }}>
        {text}
      </a>
    </Link>
  );
}
