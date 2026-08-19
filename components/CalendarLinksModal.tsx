import {
  type CSSProperties,
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import type { CalendarLink } from "../utils/ics";
import AppleLogo from "./svgs/AppleLogo";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import GoogleCalendarLogo from "./svgs/GoogleCalendarLogo";
import styles from "../styles/AddToCalendarButton.module.scss";

/** Breathing room between the sheet and both the trigger and the viewport. */
const GAP = 8;

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

/**
 * Keeps the sheet on top of the card it was opened from.
 *
 * The trigger moves under the sheet whenever a carousel is flicked or the page
 * is scrolled, so the position is measured again on both - `capture` because a
 * row scrolls itself, and a scroll event on an element does not bubble.
 */
function useAnchoredPosition(
  anchor: HTMLElement | null | undefined,
  panelRef: { current: HTMLElement | null },
  /* The panel only exists once the portal target does, and the first pass runs
     before that - without this the measurement never happens. */
  mounted: boolean,
) {
  const [position, setPosition] = useState<CSSProperties>();

  useLayoutEffect(() => {
    if (!anchor || !mounted) return;

    const place = () => {
      const panel = panelRef.current;

      if (!panel) return;

      const trigger = anchor.getBoundingClientRect();
      const { height, width } = panel.getBoundingClientRect();

      /* Above the trigger by preference - the button sits at the bottom of a
         card, so the sheet then covers the card rather than what follows it. */
      const above = trigger.top - GAP - height;

      setPosition({
        left: Math.min(
          Math.max(GAP, trigger.left + trigger.width / 2 - width / 2),
          Math.max(GAP, window.innerWidth - width - GAP),
        ),
        top:
          above >= GAP
            ? above
            : Math.min(trigger.bottom + GAP, window.innerHeight - height - GAP),
      });
    };

    place();

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);

    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor, panelRef, mounted]);

  return position;
}

/**
 * Closes the sheet once the card it belongs to has been scrolled away.
 *
 * Without this the sheet stays pinned to the viewport edge after its card has
 * left the row, pointing at whatever card happens to be there now. The
 * observer sees the row's clipping as well as the viewport's, so flicking the
 * carousel counts as scrolling the card away.
 */
function useCloseWhenAnchorLeaves(
  anchor: HTMLElement | null | undefined,
  onClose: () => void,
) {
  useEffect(() => {
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) onClose();
      },
      { threshold: 0.5 },
    );

    observer.observe(anchor);

    return () => observer.disconnect();
  }, [anchor, onClose]);
}

export interface CalendarLinksModalProps {
  links: CalendarLink[];
  title: string;
  dialogLabel: string;
  /** Rendered under the provider list - used for the .ics fallback. */
  footer?: ReactNode;
  /** The button the sheet was opened from; it opens on top of that card. */
  anchor?: HTMLElement | null;
  onClose: (ev?: ReactMouseEvent) => void;
}

/** The provider sheet itself, once a calendar button has been opened. */
export default function CalendarLinksModal({
  links,
  title,
  dialogLabel,
  footer,
  anchor,
  onClose,
}: CalendarLinksModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  /* Stable identity: the observer below would otherwise be torn down and set
     up again on every render. */
  const closeSheet = useCallback(() => onClose(), [onClose]);

  /* A card inside ScrollRow cannot host this: the row sets `contain: paint`,
     which makes it the containing block for fixed descendants and clips them
     to itself, so the sheet landed in the middle of the row and dimmed every
     card in it. Portalling to the body takes it out of the row - null until
     mounted, since the body only exists in the browser. */
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => setPortalTarget(document.body), []);

  const position = useAnchoredPosition(anchor, panelRef, portalTarget !== null);

  useCloseWhenAnchorLeaves(anchor, closeSheet);

  if (!portalTarget) return null;

  const anchored = Boolean(anchor);

  return createPortal(
    <div className={anchored ? styles.anchoredOverlay : styles.overlay}>
      {/* See Modal.tsx: click-outside as a real button, not a div handler. */}
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={`${styles.modal} ${anchored ? styles.anchored : ""}`}
        style={anchored ? position : undefined}
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
    </div>,
    portalTarget,
  );
}
