import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import useUser from "../hooks/useUser";
import { ButtonType, OrganizationRole } from "../types/types";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import styles from "../styles/AnnouncementBanner.module.scss";

const ANNOUNCEMENT_ID = "whats-new-2026-04-social-links-and-coorganizers";
const ANNOUNCEMENT_KEY = `peoply-announcement:${ANNOUNCEMENT_ID}`;
const ANNOUNCEMENT_END_AT = new Date("2026-06-01T00:00:00.000+02:00");

interface AnnouncementState {
  firstSeenAt: string;
  acknowledgedAt?: string;
}

export default function AnnouncementBanner() {
  const router = useRouter();
  const { user, orgs, currentOrg } = useUser();
  const [visible, setVisible] = useState(false);

  const manageableOrganizations = useMemo(() => {
    if (!user || !orgs) {
      return [];
    }

    return orgs.filter((organization) =>
      organization.organizationRoles.some(
        (organizationRole) =>
          organizationRole.userId === user.id &&
          organizationRole.role !== OrganizationRole.MEMBER,
      ),
    );
  }, [orgs, user]);

  const targetOrganization = useMemo(() => {
    if (!manageableOrganizations.length) {
      return undefined;
    }

    if (currentOrg) {
      const activeOrganization = manageableOrganizations.find(
        (organization) => organization.id === currentOrg.id,
      );

      if (activeOrganization) {
        return activeOrganization;
      }
    }

    return manageableOrganizations[0];
  }, [currentOrg, manageableOrganizations]);

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

  const openSocialLinksSettings = async () => {
    if (!targetOrganization) {
      acknowledgeAnnouncement();
      return;
    }

    acknowledgeAnnouncement();
    await router.push(
      `/orgs/${targetOrganization.urlId ?? targetOrganization.id}/settings`,
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      label="Foreninger kan nå gjøre mer på Peoply"
      description="Du kan nå legge til nettside, Instagram, Facebook, TikTok, LinkedIn og YouTube på foreningssiden.
Du kan også samarbeide med flere foreninger om arrangementer direkte på Peoply."
      closeButtonOnClick={acknowledgeAnnouncement}
    >
      <div className={styles.content}>
        <p className={styles.eyebrow}>Nytt på Peoply</p>
        {targetOrganization && (
          <p className={styles.hint}>
            Knappen under tar deg rett til innstillingene for{" "}
            {targetOrganization.name}.
          </p>
        )}
        <p className={styles.hint}>
          Medarrangører kan legges til og fjernes fra Rediger arrangement.
        </p>
        <div className={styles.actions}>
          {targetOrganization && (
            <ModalButton text="Gjør det nå" onClick={openSocialLinksSettings} />
          )}
          <ModalButton
            text={targetOrganization ? "Senere" : "Skjønner"}
            onClick={acknowledgeAnnouncement}
            type={ButtonType.SECONDARY}
          />
        </div>
      </div>
    </Modal>
  );
}
