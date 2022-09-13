// Components.
import LoadingWheel from "./LoadingWheel";

// Types.
import { ButtonType } from "../types/types";

// Styles.
import styles from "../styles/Button.module.scss";
import { useState } from "react";

export enum IconPlacement {
  LEFT = "left",
  ABOVE = "above",
  ABOVE_ON_MOBILE = "aboveOnMobile",
}

interface ButtonProps {
  text: string;
  type?: ButtonType;
  onClick?: ((e: MouseEvent) => void) | ((e: MouseEvent) => Promise<void>);
  className?: string;
  disabled?: boolean;
  small?: boolean;
  width?: string;
  noShadow?: boolean;
  loading?: boolean;
  loadingIconLatency?: number;
  icon?: React.ReactNode;
  iconPlacement?: IconPlacement;
}

export default function Button({
  text,
  type,
  onClick,
  className,
  disabled,
  small,
  width,
  noShadow,
  loading,
  loadingIconLatency = 150,
  icon,
  iconPlacement = IconPlacement.LEFT,
}: ButtonProps) {
  const [onClickLoadingState, setOnClickLoadingState] = useState(false);
  const [onClickDisableState, setOnClickDisableState] = useState(false);
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
      case ButtonType.HIGHLIGHTEDEVENTCARD:
        return `${styles.button} ${styles.highlightedEventCardButton} ${
          small && styles.small
        } ${noShadow && styles.noShadow}`;
      case ButtonType.REGISTERED:
        return `${styles.button} ${styles.registeredButton} ${
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
      case IconPlacement.ABOVE:
        return styles.iconAbove;
      case IconPlacement.ABOVE_ON_MOBILE:
        return styles.iconAboveOnMobile;
    }
  };

  return (
    <button
      onClick={async (e: any) => {
        let onClickResult: any = null;

        // show loading wheel after `loadingIconLatency` ms
        setOnClickDisableState(true);
        setTimeout(() => {
          //if the function is done, dont show loading wheel
          if (onClickResult === null) {
            setOnClickLoadingState(true);
          }
        }, loadingIconLatency);

        // Call onClick function
        if (onClick) {
          onClickResult = await onClick(e);
        }

        // turn off disabled and loading
        setOnClickLoadingState(false);
        setOnClickDisableState(false);
      }}
      className={`${buttonStyles} ${className} ${getIconPlacementStyles()}`}
      style={{ width }}
      disabled={loading || onClickDisableState || disabled}
    >
      {loading || onClickLoadingState ? (
        <LoadingWheel
          dark={
            type === ButtonType.WARNING ||
            type === ButtonType.DANGER ||
            type === ButtonType.HIGHLIGHTEDEVENTCARD
          }
        />
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </button>
  );
}
