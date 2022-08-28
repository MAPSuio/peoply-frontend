// Components.
import Layout from "./Layout";
import MyEventCard from "./MyEventCard";
import BackButton from "./BackButton";

// Hooks.
import useBack from "../hooks/useBack";

// Assets.
import { Alignment, Event } from "../types/types";

// Styles.
import styles from "../styles/EventList.module.scss";

interface EventListProps {
  title: string;
  description: string;
  events: Event[];
}

const EventList = ({ title, description, events }: EventListProps) => {
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
          <MyEventCard key={event.id} event={event} />
        ))}
      </div>
    </Layout>
  );
};

export default EventList;
