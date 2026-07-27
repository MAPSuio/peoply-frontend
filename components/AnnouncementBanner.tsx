import { useEffect, useState } from "react";

import Modal from "./Modal";
import ModalButton from "./ModalButton";
import GithubIcon from "./svgs/GithubIcon";
import styles from "../styles/AnnouncementBanner.module.scss";

const ANNOUNCEMENT_ID = "open-source-2026-07";
const ANNOUNCEMENT_KEY = `peoply-announcement:${ANNOUNCEMENT_ID}`;
const ANNOUNCEMENT_END_AT = new Date("2027-01-01T00:00:00.000+01:00");

const REPOSITORIES = [
  {
    name: "peoply-frontend",
    description: "Appen du bruker akkurat nå",
    url: "https://github.com/MAPSuio/peoply-frontend",
  },
  {
    name: "peoply-backend",
    description: "API-et som driver det hele",
    url: "https://github.com/MAPSuio/peoply-backend",
  },
];

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
    <Modal
      label="Peoply er open source! 🎉"
      description="Peoply eies av studentene - av deg. Alle kan lese koden, melde inn feil og bygge Peoply videre."
      closeButtonOnClick={acknowledgeAnnouncement}
    >
      <div className={styles.content}>
        <p className={styles.eyebrow}>Stor nyhet</p>
        <div className={styles.repoList}>
          {REPOSITORIES.map((repository) => (
            <a
              key={repository.url}
              href={repository.url}
              target="_blank"
              rel="noreferrer"
              className={styles.repoLink}
            >
              <GithubIcon className={styles.repoIcon} />
              <span className={styles.repoText}>
                <span className={styles.repoName}>{repository.name}</span>
                <span className={styles.repoDescription}>
                  {repository.description}
                </span>
              </span>
            </a>
          ))}
        </div>
        <p className={styles.hint}>
          Gi det en stjerne ⭐ på GitHub og bli med og bidra!
        </p>
        <p className={styles.hint}>
          Og ja: bidrag her kan du helt seriøst føre opp som prosjekterfaring på
          CV-en. 💼
        </p>
        <div className={styles.actions}>
          <ModalButton
            text="Fy! Nå ble jeg gæssed på en pils 🎉"
            onClick={acknowledgeAnnouncement}
          />
        </div>
      </div>
    </Modal>
  );
}
