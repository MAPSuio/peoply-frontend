import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";

import type { CalendarLink } from "../utils/ics";
import AppleLogo from "./svgs/AppleLogo";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import GoogleCalendarLogo from "./svgs/GoogleCalendarLogo";
import styles from "../styles/AddToCalendarButton.module.scss";

interface CalendarProviderLinkProps {
  link: CalendarLink;
  onNavigate: () => void;
}

function CalendarProviderLink({ link, onNavigate }: CalendarProviderLinkProps) {
  return (
    <a
      href={link.href}
      target={link.external ? "_blank" : undefined}
      rel={link.external ? "noreferrer" : undefined}
      className={styles.linkCard}
      onClick={(ev) => {
        ev.stopPropagation();
        onNavigate();
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
        <span className={styles.linkDescription}>{link.description}</span>
      </span>
      <span className={styles.linkChevron} aria-hidden="true">
        <ChevronRightIcon />
      </span>
    </a>
  );
}

export interface CalendarLinksModalProps {
  links: CalendarLink[];
  title: string;
  dialogLabel: string;
  /** Rendered under the provider list - used for the .ics fallback. */
  footer?: ReactNode;
  onClose: (ev?: ReactMouseEvent) => void;
}

/** The provider sheet itself, once a calendar button has been opened. */
export default function CalendarLinksModal({
  links,
  title,
  dialogLabel,
  footer,
  onClose,
}: CalendarLinksModalProps) {
  return (
    <div className={styles.overlay}>
      {/* See Modal.tsx: click-outside as a real button, not a div handler. */}
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
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
            onClick={onClose}
          >
            Lukk
          </button>
        </div>
        <div className={styles.linkList}>
          {links.map((link) => (
            <CalendarProviderLink
              key={link.provider}
              link={link}
              onNavigate={onClose}
            />
          ))}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
