import { useEffect, useState } from "react";

import styles from "../styles/AnnouncementBanner.module.scss";

const ANNOUNCEMENT_ID = "auth-upgrade-2026-03-27";
const ANNOUNCEMENT_KEY = `peoply-announcement:${ANNOUNCEMENT_ID}`;
const ANNOUNCEMENT_END_AT = new Date("2026-04-03T23:59:59.999+01:00");

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
      className={styles.overlay}
      onClick={acknowledgeAnnouncement}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
      >
        <p className={styles.eyebrow}>Viktig informasjon</p>
        <h2 className={styles.title} id="announcement-title">
          Peoply oppgraderer autentiseringsløsningene
        </h2>
        <p className={styles.copy}>
          Vi oppgraderer autentiseringsløsningene våre som følge av store
          mengder angrep mot Peoply.
        </p>
        <p className={styles.copy}>
          I perioden kan autentiseringstjenester tidvis være utilgjengelige på
          siden. :)
        </p>
        <div className={styles.actions}>
          <button className={styles.button} onClick={acknowledgeAnnouncement}>
            Skjønner
          </button>
        </div>
      </div>
    </div>
  );
}
