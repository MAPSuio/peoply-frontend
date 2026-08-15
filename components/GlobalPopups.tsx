import { useEffect, useState } from "react";
import useSWR from "swr";

import { fetchFromPeoplyApiJson } from "../services/fetchers";
import type { Popup } from "../types/types";
import { trackEvent } from "../utils/analytics";
import styles from "../styles/GlobalPopups.module.scss";
import Modal from "./Modal";
import ModalButton from "./ModalButton";

/**
 * Reports a popup as seen, at most once per browser.
 *
 * Deliberately not once per render: the popup reappears on every page load
 * until it is dismissed, so an event per display would measure page views
 * rather than how many people saw it - and a reader who never dismisses it
 * would count once per page they open.
 */
function trackSeenOnce(popup: Popup) {
  const seenKey = `peoply-popup-seen:${popup.id}`;

  try {
    if (window.localStorage.getItem(seenKey)) return;
    window.localStorage.setItem(seenKey, "1");
  } catch {
    /* No storage means no way to deduplicate. Send it anyway and let Umami's
       unique-visitor count carry the meaning, rather than silently dropping
       every view from browsers with storage disabled. */
  }

  trackEvent("popup-vist", { id: popup.id, title: popup.title });
}

function ScheduledPopup({ popup }: { popup: Popup }) {
  const storageKey = `peoply-popup:${popup.id}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let acknowledged = false;
    try {
      acknowledged = window.localStorage.getItem(storageKey) === "acknowledged";
    } catch {
      acknowledged = false;
    }

    setVisible(!acknowledged);
    /* Only what actually reaches the screen counts as seen. */
    if (!acknowledged) trackSeenOnce(popup);
  }, [storageKey, popup]);

  const close = () => {
    try {
      window.localStorage.setItem(storageKey, "acknowledged");
    } catch {
      // The popup can still be closed when storage is unavailable.
    }
    /* Paired with popup-vist, this gives a dismissal rate: how many of the
       people who saw it actually closed it rather than navigating away. */
    trackEvent("popup-lukket", { id: popup.id, title: popup.title });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal label={popup.title} closeButtonOnClick={close}>
      <div className={styles.content}>
        {popup.body.split(/\n\s*\n/).map((paragraph, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: plain text paragraphs have no stable identity.
          <p key={index}>{paragraph}</p>
        ))}
        <ModalButton text="Lukk" onClick={close} />
      </div>
    </Modal>
  );
}

export default function GlobalPopups() {
  /* Mounted in _app, so this runs on every page. A popup that only starts
     mattering once it is scheduled does not need to appear mid-session:
     picking it up on the next page load is soon enough, and polling from
     every open tab is a request per minute per tab for a value that changes
     a handful of times a semester. */
  const { data } = useSWR<Popup | undefined>(
    "/popups/active",
    fetchFromPeoplyApiJson,
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  );

  /* Nothing scheduled, still loading and a failed lookup all mean the same
     thing here: no dialog. Every announcement is a scheduled popup now, so
     there is no hardcoded fallback to fall back to. */
  if (!data) return null;

  return <ScheduledPopup popup={data} />;
}
