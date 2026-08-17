import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useState,
} from "react";

import { ButtonSize, ButtonType } from "../types/types";
import type { CalendarLink } from "../utils/ics";
import Button, { IconPlacement } from "./Button";
import AppleLogo from "./svgs/AppleLogo";
import CalendarIconCard from "./svgs/CalendarIconCard";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import GoogleCalendarLogo from "./svgs/GoogleCalendarLogo";
import styles from "../styles/AddToCalendarButton.module.scss";

interface CalendarLinksButtonProps {
  links: CalendarLink[];
  buttonText: string;
  title: string;
  dialogLabel: string;
  /** Rendered under the provider list - used for the .ics fallback. */
  footer?: ReactNode;
  className?: string;
  iconPlacement?: IconPlacement;
  size?: ButtonSize;
  type?: ButtonType;
  width?: string;
  /** Icon-only rendering for narrow layouts; the text stays as the
   *  accessible name. */
  iconOnly?: boolean;
}

/**
 * The provider picker behind every calendar button - one arrangement or a whole
 * organization's feed, the modal is the same. Callers supply the links and the
 * copy; everything about opening, closing and rendering the sheet lives here.
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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  if (links.length === 0) return null;

  const handleToggle = (ev: ReactMouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setIsOpen((current) => !current);
  };

  const closeMenu = (ev?: ReactMouseEvent) => {
    ev?.preventDefault();
    ev?.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        text={buttonText}
        type={type}
        size={size}
        width={width}
        onClick={handleToggle}
        noShadow
        icon={<CalendarIconCard className={styles.icon} />}
        iconPlacement={iconPlacement}
        hideText={iconOnly}
        className={`${styles.addToCalendarButton} ${className ?? ""}`}
      />
      {isOpen && (
        <div className={styles.overlay}>
          {/* See Modal.tsx: click-outside as a real button, not a div handler. */}
          <button
            type="button"
            className={styles.backdrop}
            onClick={closeMenu}
            tabIndex={-1}
            aria-hidden="true"
          />
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={dialogLabel}
          >
            <div className={styles.header}>
              <div>
                <p className={styles.eyebrow}>Kalender</p>
                <h3 className={styles.title}>{title}</h3>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeMenu}
              >
                Lukk
              </button>
            </div>
            <div className={styles.linkList}>
              {links.map((link) => (
                <a
                  key={link.provider}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className={styles.linkCard}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.linkLogo} aria-hidden="true">
                    {link.provider === "google" ? (
                      <GoogleCalendarLogo className={styles.providerLogo} />
                    ) : (
                      <AppleLogo className={styles.providerLogo} />
                    )}
                  </span>
                  <span className={styles.linkText}>
                    <span className={styles.linkLabel}>{link.label}</span>
                    <span className={styles.linkDescription}>
                      {link.description}
                    </span>
                  </span>
                  <span className={styles.linkChevron} aria-hidden="true">
                    <ChevronRightIcon />
                  </span>
                </a>
              ))}
            </div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </div>
        </div>
      )}
    </>
  );
}
