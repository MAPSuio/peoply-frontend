import {
  type CSSProperties,
  forwardRef,
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

/** Breathing room between the sheet and the viewport edges. */
const GAP = 8;

/** Below this the anchor is a button, not a card, and cannot lend its width. */
const MIN_ANCHOR_WIDTH = 240;

const MAX_SHEET_WIDTH = 420;

/** How far the card may drift before it counts as having been scrolled away. */
const SCROLL_TOLERANCE = 12;

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

/** Keeps the sheet inside the viewport, whatever the anchor is doing. */
const clamp = (value: number, size: number, viewport: number) =>
  Math.min(Math.max(GAP, value), Math.max(GAP, viewport - size - GAP));

/**
 * Lays the sheet on top of the card it was opened from: same centre, and the
 * card's width when the anchor is a card rather than a bare button.
 *
 * Scrolling closes the sheet rather than dragging it along, so the placement
 * only has to survive a resize and the panel's own growth - its width feeds
 * back into where it is put.
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

      const card = anchor.getBoundingClientRect();
      const panelBox = panel.getBoundingClientRect();
      /* A card is wide enough to carry the sheet; the fallback anchor is the
         button itself, and then the panel keeps the width its class gives it. */
      const width =
        card.width >= MIN_ANCHOR_WIDTH
          ? Math.min(card.width, MAX_SHEET_WIDTH)
          : panelBox.width;

      setPosition({
        left: clamp(
          card.left + card.width / 2 - width / 2,
          width,
          window.innerWidth,
        ),
        top: clamp(
          card.top + card.height / 2 - panelBox.height / 2,
          panelBox.height,
          window.innerHeight,
        ),
        width,
      });
    };

    place();

    const observer = new ResizeObserver(place);

    if (panelRef.current) observer.observe(panelRef.current);

    window.addEventListener("resize", place);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [anchor, panelRef, mounted]);

  return position;
}

/**
 * Closes the sheet as soon as the card it belongs to is scrolled.
 *
 * Following the card instead reads as a panel stuck to the screen, and once
 * the card has left the row the sheet points at whatever card took its place.
 * The tolerance is there because momentum scrolling on iOS keeps nudging the
 * page after a tap, and that must not count as scrolling away. `capture`
 * because a row scrolls itself, and a scroll event on an element does not
 * bubble.
 */
function useCloseOnScroll(
  anchor: HTMLElement | null | undefined,
  onClose: () => void,
) {
  useEffect(() => {
    if (!anchor) return;

    const opened = anchor.getBoundingClientRect();

    const closeIfMoved = () => {
      const now = anchor.getBoundingClientRect();

      if (
        Math.abs(now.top - opened.top) > SCROLL_TOLERANCE ||
        Math.abs(now.left - opened.left) > SCROLL_TOLERANCE
      ) {
        onClose();
      }
    };

    window.addEventListener("scroll", closeIfMoved, true);

    return () => window.removeEventListener("scroll", closeIfMoved, true);
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

interface CalendarSheetProps
  extends Pick<
    CalendarLinksModalProps,
    "links" | "title" | "dialogLabel" | "footer"
  > {
  className: string;
  style?: CSSProperties;
  onClose: (ev?: ReactMouseEvent) => void;
}

/** The panel: everything inside the dialog, wherever it has been placed. */
const CalendarSheet = forwardRef<HTMLDivElement, CalendarSheetProps>(
  function CalendarSheet(
    { links, title, dialogLabel, footer, className, style, onClose },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={className}
        style={style}
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
    );
  },
);

/** The provider sheet itself, once a calendar button has been opened. */
export default function CalendarLinksModal({
  anchor,
  onClose,
  ...sheet
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

  useCloseOnScroll(anchor, closeSheet);

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
      <CalendarSheet
        {...sheet}
        ref={panelRef}
        className={`${styles.modal} ${anchored ? styles.anchored : ""}`}
        style={anchored ? position : undefined}
        onClose={onClose}
      />
    </div>,
    portalTarget,
  );
}
