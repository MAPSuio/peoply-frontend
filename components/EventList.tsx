// Components.
import Layout from "./Layout";
import LargeEventCard from "./LargeEventCard";
import BackButton from "./BackButton";

// Hooks.
import useBack from "../hooks/useBack";

// Assets.
import { Alignment, Event } from "../types/types";

// Styles.
import styles from "../styles/EventList.module.scss";
import Button from "./Button";

interface EventListProps {
  title: string;
  description: string;
  events: Event[];
  nextPage?: () => void;
}

const EventList = ({
  title,
  description,
  events,
  nextPage,
}: EventListProps) => {
  const goBack = useBack();

  return (
    <Layout align={Alignment.CENTER}>
      <BackButton onClick={goBack} />
      <div className={styles.headerContainer}>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
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
