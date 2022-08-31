// Components.
import Layout from "./Layout";
import LargeEventCard from "./LargeEventCard";

// Assets.
import { Alignment, Event } from "../types/types";

// Styles.
import styles from "../styles/EventList.module.scss";
import Button from "./Button";

interface EventListProps {
  title?: string;
  description?: string;
  events: Event[];
  nextPage?: () => void;
}

const EventList = ({
  title,
  description,
  events,
  nextPage,
}: EventListProps) => {
  return (
    <Layout align={Alignment.CENTER}>
      {(title || description) && (
        <div className={styles.headerContainer}>
          {title && <h1>{title}</h1>}
          {description && <p>{description}</p>}
        </div>
      )}
      <div className={styles.eventContainer}>
        {events.map((event: Event) => (
          <LargeEventCard key={event.id} event={event} />
        ))}
      </div>
      {nextPage && (
        <Button
          className={styles.nextPageButton}
          text="Last inn flere"
          onClick={nextPage}
        />
      )}
    </Layout>
  );
};

export default EventList;
