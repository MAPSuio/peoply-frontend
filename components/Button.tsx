// React.
import { MouseEvent, useState } from "react";

// Components.
import LoadingWheel from "./LoadingWheel";

// Types.
import { ButtonSize, ButtonType } from "../types/types";

// Styles.
import styles from "../styles/Button.module.scss";

export enum IconPlacement {
  LEFT = "left",
  RIGHT = "right",
  ABOVE = "above",
  ABOVE_ON_MOBILE = "aboveOnMobile",
}

interface ButtonProps {
  text: string;
  type?: ButtonType;
  onClick?: ((e: MouseEvent) => void) | ((e: MouseEvent) => Promise<void>);
  className?: string;
  disabled?: boolean;
  size?: ButtonSize;
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
  size = ButtonSize.MEDIUM,
  width,
  noShadow,
  loading,
  loadingIconLatency = 150,
  icon,
  iconPlacement = IconPlacement.LEFT,
}: ButtonProps) {
  const [onClickLoadingState, setOnClickLoadingState] = useState(false);
  const [onClickDisableState, setOnClickDisableState] = useState(false);

  const sizeStyle = (() => {
    switch (size) {
      case ButtonSize.TINY:
        return styles.tiny;
      case ButtonSize.TINYWITHTEXT:
        return styles.tinyWithText;
      case ButtonSize.COMPACT:
        return styles.compact;
      case ButtonSize.SMALL:
        return styles.small;
      case ButtonSize.MEDIUM:
        return styles.medium;
    }
  })();

  const buttonStyles = (() => {
    switch (type) {
      case ButtonType.PRIMARY:
        return `${styles.button} ${sizeStyle} ${noShadow && styles.noShadow}`;
      case ButtonType.SECONDARY:
        return `${styles.button} ${styles.secondaryButton} ${sizeStyle} ${
          noShadow && styles.noShadow
        }`;
      case ButtonType.DANGER:
        return `${styles.button} ${styles.dangerButton} ${sizeStyle} ${
          noShadow && styles.noShadow
        }`;
      case ButtonType.DANGERSOFT:
        return `${styles.button} ${styles.dangerSoftButton} ${sizeStyle} ${
          noShadow && styles.noShadow
        }`;
      case ButtonType.WARNING:
        return `${styles.button} ${styles.warningButton} ${sizeStyle} ${
          noShadow && styles.noShadow
        }`;
      case ButtonType.WARNINGSOFT:
        return `${styles.button} ${styles.warningSoftButton} ${sizeStyle} ${
          noShadow && styles.noShadow
        }`;
      case ButtonType.HIGHLIGHTEDEVENTCARD:
        return `${styles.button} ${
          styles.highlightedEventCardButton
        } ${sizeStyle} ${noShadow && styles.noShadow}`;
      case ButtonType.CONFIRMED:
        return `${styles.button} ${styles.confirmedButton} ${sizeStyle} ${
          noShadow && styles.noShadow
        }`;
      default:
        return `${styles.button} ${sizeStyle} ${noShadow && styles.noShadow}`;
    }
  })();

  const iconPlacementStyles = (() => {
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
  })();

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
      className={`${buttonStyles} ${className} ${iconPlacementStyles}`}
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
          <span>{text}</span>
        </>
      )}
    </button>
  );
}
