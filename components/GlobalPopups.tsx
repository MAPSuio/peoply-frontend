import { useEffect, useState } from "react";
import useSWR from "swr";

import { fetchFromPeoplyApiJson } from "../services/fetchers";
import type { Popup } from "../types/types";
import styles from "../styles/GlobalPopups.module.scss";
import AnnouncementBanner from "./AnnouncementBanner";
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
  const { data, error, isLoading } = useSWR<Popup | null>(
    "/popups/active",
    fetchFromPeoplyApiJson,
    { refreshInterval: 60_000 },
  );

  if (isLoading) return null;
  if (data) return <ScheduledPopup popup={data} />;

  // Keep the existing announcement as fallback, but never mount two dialogs.
  if (data === null || error) return <AnnouncementBanner />;
  return null;
}
