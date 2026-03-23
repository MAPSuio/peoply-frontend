import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "../styles/AnnouncementBanner.module.scss";

const ANNOUNCEMENT_ID = "calendar-tools-2026-03-23";
const ANNOUNCEMENT_KEY = `peoply-announcement:${ANNOUNCEMENT_ID}`;
const ANNOUNCEMENT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

      setVisible(now.getTime() - firstSeenAt.getTime() < ANNOUNCEMENT_TTL_MS);
    } catch {
      setVisible(true);
    }
  }, []);

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
    <div className={styles.wrapper}>
      <div className={styles.banner}>
        <p className={styles.copy}>
          Nytt i Peoply: Du kan nå legge arrangementer i kalenderen din og
          abonnere på foreningers arrangementer fra organisasjonssiden deres.
        </p>
        <div className={styles.actions}>
          <Link href="/integrasjoner" className={styles.link}>
            Les mer
          </Link>
          <button className={styles.button} onClick={acknowledgeAnnouncement}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
