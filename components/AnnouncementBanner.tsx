import { useEffect, useState } from "react";

import styles from "../styles/AnnouncementBanner.module.scss";

const ANNOUNCEMENT_ID = "whats-new-2026-03";
const ANNOUNCEMENT_KEY = `peoply-announcement:${ANNOUNCEMENT_ID}`;
const ANNOUNCEMENT_END_AT = new Date("2026-04-13T23:59:59.999+02:00");

interface AnnouncementState {
  firstSeenAt: string;
  acknowledgedAt?: string;
}

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const now = new Date();

      if (now.getTime() > ANNOUNCEMENT_END_AT.getTime()) {
        window.localStorage.removeItem(ANNOUNCEMENT_KEY);
        setVisible(false);
        return;
      }

      const storedValue = window.localStorage.getItem(ANNOUNCEMENT_KEY);

      if (!storedValue) {
        const nextState: AnnouncementState = {
          firstSeenAt: now.toISOString(),
        };

        window.localStorage.setItem(
          ANNOUNCEMENT_KEY,
          JSON.stringify(nextState),
        );
        setVisible(true);
        return;
      }

      const parsedValue = JSON.parse(storedValue) as AnnouncementState;
      if (parsedValue.acknowledgedAt) {
        setVisible(false);
        return;
      }

      const firstSeenAt = new Date(parsedValue.firstSeenAt);
      if (Number.isNaN(firstSeenAt.getTime())) {
        window.localStorage.removeItem(ANNOUNCEMENT_KEY);
        setVisible(true);
        return;
      }

      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible || typeof window === "undefined") {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        acknowledgeAnnouncement();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [visible]);

  const acknowledgeAnnouncement = () => {
    if (typeof window !== "undefined") {
      const storedValue = window.localStorage.getItem(ANNOUNCEMENT_KEY);
      let firstSeenAt = new Date().toISOString();

      if (storedValue) {
        try {
          const parsedValue = JSON.parse(storedValue) as AnnouncementState;
          if (parsedValue.firstSeenAt) {
            firstSeenAt = parsedValue.firstSeenAt;
          }
        } catch {
          firstSeenAt = new Date().toISOString();
        }
      }

      const nextState: AnnouncementState = {
        firstSeenAt,
        acknowledgedAt: new Date().toISOString(),
      };

      window.localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(nextState));
    }

    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className={styles.banner}
      role="status"
      aria-labelledby="announcement-title"
    >
      <div className={styles.content}>
        <p className={styles.eyebrow}>Nytt på Peoply</p>
        <ul className={styles.list}>
          <li>Delt kalender, se alle arrangementer samlet</li>
          <li>
            Kalenderabonnement (automatisk .ics fetch) for foreninger (se
            admin-siden på din forening)
          </li>
          <li>Redigere kapasitet på arrangementer</li>
          <li>
            Ekstern påmelding for arrangementer (funker også med automatisk
            .ics)
          </li>
          <li>Meld deg på/av direkte fra arrangementskort</li>
          <li>Filtrér arrangementer etter forening</li>
          <li>Gi oss tilbakemelding rett i Peoply!</li>
        </ul>
        <div className={styles.actions}>
          <button className={styles.button} onClick={acknowledgeAnnouncement}>
            Kult!
          </button>
        </div>
      </div>
    </div>
  );
}
