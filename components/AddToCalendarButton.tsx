import { MouseEvent as ReactMouseEvent, useEffect, useState } from "react";

import { ButtonSize, ButtonType, Event } from "../types/types";
import { getCalendarLinks } from "../utils/ics";
import Button, { IconPlacement } from "./Button";
import CalendarIconCard from "./svgs/CalendarIconCard";
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
  const links = getCalendarLinks(event);

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
        <div className={styles.overlay} onClick={closeMenu} role="presentation">
          <div
            className={styles.modal}
            onClick={(ev) => ev.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Legg arrangement i kalender"
          >
            <div className={styles.header}>
              <div>
                <p className={styles.eyebrow}>Kalender</p>
                <h3 className={styles.title}>Legg til arrangement</h3>
              </div>
              <button className={styles.closeButton} onClick={closeMenu}>
                Lukk
              </button>
            </div>
            <div className={styles.linkList}>
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className={styles.linkCard}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.linkLabel}>{link.label}</span>
                  <span className={styles.linkDescription}>
                    {link.description}
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
