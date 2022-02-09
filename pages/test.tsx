import { NextPage } from "next";
import useSWR from "swr";
import MyEventCard from "../components/MyEventCard";
import { fetchFromPeoplyApi } from "../services/fetchers";

import styles from "../styles/Test.module.scss";

const Test: NextPage = () => {
  /* Fetch test event. */
  const { data: event, error: eventError } = useSWR(
    "/events/1",
    fetchFromPeoplyApi,
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1>Event card</h1>
        {event && <MyEventCard event={event} />}
      </div>
    </div>
  );
};

export default Test;
