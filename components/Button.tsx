// Components.
import LoadingWheel from "./LoadingWheel";

// Types.
import { ButtonType } from "../types/types";

// Styles.
import styles from "../styles/Button.module.scss";
import { useState } from "react";

interface ButtonProps {
  text: string;
  type?: ButtonType;
  onClick?: ((e: any) => void) | ((e: any) => Promise<void>);
  className?: string;
  disabled?: boolean;
  isLink?: boolean;
  small?: boolean;
  noShadow?: boolean;
  loading?: boolean;
  loadingIconLatency?: number;
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
  loadingIconLatency = 150,
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
          className={`${buttonStyles} ${className}`}
          disabled={loading || onClickDisableState || disabled}
          onClick={(e) => {
            // the button will be in a loading state forever after clicking the button
            setOnClickLoadingState(true);
            setOnClickDisableState(true);
            if (onClick) onClick(e);
          }}
        >
          {loading || onClickLoadingState ? (
            <LoadingWheel
              dark={type === ButtonType.WARNING || type === ButtonType.DANGER}
            />
          ) : (
            text
          )}
        </button>
      </a>
    );
  } else {
    return (
      <button
        onClick={async (e) => {
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
        className={`${buttonStyles} ${className}`}
        disabled={loading || onClickDisableState || disabled}
      >
        {loading || onClickLoadingState ? (
          <LoadingWheel
            dark={type === ButtonType.WARNING || type === ButtonType.DANGER}
          />
        ) : (
          text
        )}
      </button>
    );
  }
}
