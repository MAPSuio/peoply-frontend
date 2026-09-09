import type { ReactNode } from "react";

import type { Popup } from "../../types/types";
import { type PopupStatus, groupPopupsByStatus } from "../../utils/popups";
import type { PopupInterval } from "../PopupDateRangeButton";
import PopupCard from "./PopupCard";

import styles from "../../styles/PopupScheduler.module.scss";

const SECTIONS: Array<{
  status: PopupStatus;
  headingId: string;
  heading: string;
  empty: ReactNode;
  listed: boolean;
}> = [
  {
    status: "active",
    headingId: "active-heading",
    heading: "Aktiv pop-up",
    empty: (
      <div className={styles.emptyActive}>
        <p>Ingen pop-up er aktiv akkurat nå.</p>
      </div>
    ),
    listed: false,
  },
  {
    status: "upcoming",
    headingId: "upcoming-heading",
    heading: "Kommende",
    empty: <p className={styles.empty}>Ingen planlagte pop-ups.</p>,
    listed: true,
  },
  {
    status: "past",
    headingId: "history-heading",
    heading: "Historikk",
    empty: <p className={styles.empty}>Ingen tidligere pop-ups.</p>,
    listed: true,
  },
];

export interface PopupSectionsProps {
  popups: Popup[];
  onEdit: (popup: Popup) => void;
  onChangeDates: (popupId: string, interval: PopupInterval) => Promise<void>;
  onDelete: (popup: Popup) => void;
}

function listWrapper(listed: boolean, children: ReactNode) {
  return listed ? <div className={styles.list}>{children}</div> : children;
}

export default function PopupSections({
  popups,
  onEdit,
  onChangeDates,
  onDelete,
}: PopupSectionsProps) {
  const grouped = groupPopupsByStatus(popups, Date.now());

  return (
    <div className={styles.sections}>
      {SECTIONS.map(({ status, headingId, heading, empty, listed }) => (
        <section key={status} aria-labelledby={headingId}>
          <div className={styles.sectionHeading}>
            <h2 id={headingId}>{heading}</h2>
          </div>
          {listWrapper(
            listed,
            grouped[status].length === 0
              ? empty
              : grouped[status].map((popup) => (
                  <PopupCard
                    key={popup.id}
                    popup={popup}
                    variant={status}
                    onEdit={() => onEdit(popup)}
                    onChangeDates={(interval) =>
                      onChangeDates(popup.id, interval)
                    }
                    onDelete={() => onDelete(popup)}
                  />
                )),
          )}
        </section>
      ))}
    </div>
  );
}
