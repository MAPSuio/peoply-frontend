import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

import { ButtonSize, ButtonType } from "../types/types";
import type { CalendarLink } from "../utils/ics";
import Button, { IconPlacement } from "./Button";
import CalendarLinksModal from "./CalendarLinksModal";
import CalendarIconCard from "./svgs/CalendarIconCard";
import styles from "../styles/AddToCalendarButton.module.scss";

/** What the trigger button looks like; passed straight through to `Button`. */
export interface CalendarButtonAppearance {
  className?: string;
  iconPlacement?: IconPlacement;
  size?: ButtonSize;
  type?: ButtonType;
  width?: string;
  /** Icon-only rendering for narrow layouts; the text stays as the
   *  accessible name. */
  iconOnly?: boolean;
}

export interface CalendarLinksButtonProps extends CalendarButtonAppearance {
  links: CalendarLink[];
  buttonText: string;
  title: string;
  dialogLabel: string;
  /** Rendered under the provider list - used for the .ics fallback. */
  footer?: ReactNode;
}

/**
 * The trigger behind every calendar button - one arrangement or a whole
 * organization's feed opens the same provider sheet. Callers supply the links
 * and the copy; the sheet itself lives in CalendarLinksModal.
 */
export default function CalendarLinksButton({
  links,
  buttonText,
  title,
  dialogLabel,
  footer,
  className,
  iconPlacement = IconPlacement.LEFT,
  size = ButtonSize.SMALL,
  type = ButtonType.SECONDARY,
  width,
  iconOnly = false,
}: CalendarLinksButtonProps) {
  /* The sheet opens on top of the card the button sits in, so it needs the
     button itself, not just the fact that it was pressed. */
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const isOpen = anchor !== null;

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setAnchor(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  if (links.length === 0) return null;

  const stop = (ev?: ReactMouseEvent) => {
    ev?.preventDefault();
    ev?.stopPropagation();
  };

  return (
    <>
      <Button
        text={buttonText}
        type={type}
        size={size}
        width={width}
        onClick={(ev?: ReactMouseEvent) => {
          const trigger = ev?.currentTarget as HTMLElement | undefined;

          stop(ev);
          setAnchor((current) => (current ? null : (trigger ?? null)));
        }}
        noShadow
        icon={<CalendarIconCard className={styles.icon} />}
        iconPlacement={iconPlacement}
        hideText={iconOnly}
        className={`${styles.addToCalendarButton} ${className ?? ""}`}
      />
      {isOpen && (
        <CalendarLinksModal
          links={links}
          title={title}
          dialogLabel={dialogLabel}
          footer={footer}
          anchor={anchor}
          onClose={(ev?: ReactMouseEvent) => {
            stop(ev);
            setAnchor(null);
          }}
        />
      )}
    </>
  );
}
