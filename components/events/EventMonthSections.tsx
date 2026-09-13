import type { EventMonthGroup } from "../../utils/eventListing";
import LargeEventCard from "../LargeEventCard";

import styles from "../../styles/EventsPage.module.scss";

export interface EventMonthSectionsProps {
  groups: EventMonthGroup[];
  isCompactGrid: boolean;
}

export default function EventMonthSections({
  groups,
  isCompactGrid,
}: EventMonthSectionsProps) {
  return (
    <div className={styles.monthSections}>
      {groups.map((group) => (
        <section key={group.key} className={styles.monthSection}>
          <div className={styles.monthHeader}>
            <h2>{group.label}</h2>
            <p>{group.events.length} arrangementer</p>
          </div>
          <div
            className={`${styles.eventGrid} ${
              isCompactGrid ? styles.eventGridCompact : ""
            }`}
          >
            {group.events.map((event) => (
              <LargeEventCard
                key={event.id}
                event={event}
                showArranger
                compact={isCompactGrid}
                stackActionsOnDesktop={isCompactGrid}
                className={styles.eventCard}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
