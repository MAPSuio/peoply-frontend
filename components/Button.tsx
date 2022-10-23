// Components.
import LoadingWheel from "./LoadingWheel";

// Types.
import { ButtonSize, ButtonType } from "../types/types";

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

  const sizeStyle =
    size === ButtonSize.SMALL
      ? styles.small
      : size === ButtonSize.TINY
      ? styles.tiny
      : undefined;
  const shadowStyle = noShadow ? styles.noShadow : undefined;

  const buttonStyles = (() => {
    switch (type) {
      case ButtonType.PRIMARY:
        return `${styles.button} ${sizeStyle} ${shadowStyle}`;
      case ButtonType.SECONDARY:
        return `${styles.button} ${styles.secondaryButton} ${sizeStyle} ${shadowStyle}`;
      case ButtonType.DANGER:
        return `${styles.button} ${styles.dangerButton} ${sizeStyle} ${shadowStyle}`;
      case ButtonType.WARNING:
        return `${styles.button} ${styles.warningButton} ${sizeStyle} ${shadowStyle}`;
      case ButtonType.HIGHLIGHTEDEVENTCARD:
        return `${styles.button} ${styles.highlightedEventCardButton} ${sizeStyle} ${shadowStyle}`;
      case ButtonType.REGISTERED:
        return `${styles.button} ${styles.registeredButton} ${sizeStyle} ${shadowStyle}`;
      default:
        return `${styles.button} ${sizeStyle} ${shadowStyle}`;
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
