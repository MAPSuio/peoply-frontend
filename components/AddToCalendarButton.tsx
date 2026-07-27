import { type MouseEvent as ReactMouseEvent, useEffect, useState } from "react";

import { ButtonSize, ButtonType, type Event } from "../types/types";
import { getCalendarLinks } from "../utils/ics";
import Button, { IconPlacement } from "./Button";
import AppleLogo from "./svgs/AppleLogo";
import CalendarIconCard from "./svgs/CalendarIconCard";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import GoogleCalendarLogo from "./svgs/GoogleCalendarLogo";
import styles from "../styles/AddToCalendarButton.module.scss";

interface AddToCalendarButtonProps {
  event: Event;
  buttonText?: string;
  className?: string;
  iconPlacement?: IconPlacement;
  size?: ButtonSize;
  type?: ButtonType;
  width?: string;
}

/* Installed PWAs can't preview or download files (iOS especially), so Apple
   devices in standalone mode get a webcal:// link that opens the native
   Calendar app instead of the .ics download. */
function shouldPreferWebcal() {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;
  const isApplePlatform = /iPad|iPhone|iPod|Macintosh/.test(
    window.navigator.userAgent,
  );

  return isStandalone && isApplePlatform;
}

export default function AddToCalendarButton({
  event,
  buttonText = "Legg i kalender",
  className,
  iconPlacement = IconPlacement.LEFT,
  size = ButtonSize.SMALL,
  type = ButtonType.SECONDARY,
  width,
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferWebcal, setPreferWebcal] = useState(false);
  const links = getCalendarLinks(event, { preferWebcal });

  useEffect(() => {
    setPreferWebcal(shouldPreferWebcal());
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

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
            aria-label="Legg arrangement i kalender"
          >
            <div className={styles.header}>
              <div>
                <p className={styles.eyebrow}>Kalender</p>
                <h3 className={styles.title}>Legg til arrangement</h3>
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
          </div>
        </div>
      )}
    </>
  );
}
