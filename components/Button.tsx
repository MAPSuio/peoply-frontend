// React.
import { type MouseEvent, useState } from "react";

// Components.
import LoadingWheel from "./LoadingWheel";

// Types.
import { ButtonSize, ButtonType } from "../types/types";

// Utils.
import cx from "../utils/cx";

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

  const sizeStyles: Record<ButtonSize, string> = {
    [ButtonSize.TINY]: styles.tiny,
    [ButtonSize.TINYWITHTEXT]: styles.tinyWithText,
    [ButtonSize.COMPACT]: styles.compact,
    [ButtonSize.SMALL]: styles.small,
    [ButtonSize.MEDIUM]: styles.medium,
  };

  /* PRIMARY has no class of its own - the base .button styles are the
     primary look. */
  const typeStyles: Partial<Record<ButtonType, string>> = {
    [ButtonType.SECONDARY]: styles.secondaryButton,
    [ButtonType.DANGER]: styles.dangerButton,
    [ButtonType.DANGERSOFT]: styles.dangerSoftButton,
    [ButtonType.WARNING]: styles.warningButton,
    [ButtonType.WARNINGSOFT]: styles.warningSoftButton,
    [ButtonType.HIGHLIGHTEDEVENTCARD]: styles.highlightedEventCardButton,
    [ButtonType.CONFIRMED]: styles.confirmedButton,
  };

  const iconPlacementStyles: Record<IconPlacement, string> = {
    [IconPlacement.LEFT]: styles.iconLeft,
    [IconPlacement.RIGHT]: styles.iconRight,
    [IconPlacement.ABOVE]: styles.iconAbove,
    [IconPlacement.ABOVE_ON_MOBILE]: styles.iconAboveOnMobile,
  };

  return (
    <button
      type="button"
      onClick={async (e: MouseEvent<HTMLButtonElement>) => {
        let onClickResult: unknown = null;

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
      className={cx(
        styles.button,
        type !== undefined && typeStyles[type],
        sizeStyles[size],
        noShadow && styles.noShadow,
        className,
        iconPlacementStyles[iconPlacement],
      )}
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
