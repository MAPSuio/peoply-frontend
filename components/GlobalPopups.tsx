import { useEffect, useState } from "react";
import useSWR from "swr";

import { fetchFromPeoplyApiJson } from "../services/fetchers";
import type { Popup } from "../types/types";
import styles from "../styles/GlobalPopups.module.scss";
import Modal from "./Modal";
import ModalButton from "./ModalButton";

function ScheduledPopup({ popup }: { popup: Popup }) {
  const storageKey = `peoply-popup:${popup.id}`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(storageKey) !== "acknowledged");
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  const close = () => {
    try {
      window.localStorage.setItem(storageKey, "acknowledged");
    } catch {
      // The popup can still be closed when storage is unavailable.
    }
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
