// Components.
// Types.
import { ButtonType } from "../types/types";

// Styles.
import styles from "../styles/Button.module.scss";
import Link from "./Link";
import { IconPlacement } from "./Button";

interface LinkButtonProps {
  text: string;
  href: string;
  type?: ButtonType;
  className?: string;
  small?: boolean;
  width?: string;
  noShadow?: boolean;
  icon?: React.ReactNode;
  iconPlacement: IconPlacement;
  target?: string;
  rel?: string;
}

export default function LinkButton({
  text,
  href,
  type,
  className,
  small,
  width,
  noShadow,
  icon,
  iconPlacement = IconPlacement.LEFT,
  target,
  rel,
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

  const getIconPlacementStyles = () => {
    switch (iconPlacement) {
      case IconPlacement.LEFT:
        return styles.iconLeft;
      case IconPlacement.RIGHT:
        return styles.iconRight;
      case IconPlacement.ABOVE:
        return styles.iconAbove;
      case IconPlacement.ABOVE_ON_MOBILE:
        return styles.iconAboveOnMobile;
    }
  };

  if (target || rel) {
    return (
      <a
        href={href}
        className={`${buttonStyles} ${className} ${getIconPlacementStyles()}`}
        style={{ width }}
        target={target}
        rel={rel}
      >
        {icon}
        {text}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`${buttonStyles} ${className} ${getIconPlacementStyles()}`}
      style={{ width }}
    >
      {icon}
      {text}
    </Link>
  );
}
