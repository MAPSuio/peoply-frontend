import { NextPage } from "next";
import useSWR from "swr";
import ExpandableCard from "../components/ExpandableCard";
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
        <ExpandableCard title="Her kommer tittel">
          <p>
            Peoply lagrer kun persondataen som kommer fra innloggingen gjennom
            Vipps. Dette inkluderer:
          </p>
          <ul>
            <li>Fornavn</li>
            <li>Etternavn</li>
            <li>Telefonnummer</li>
            <li>Fødselsdato</li>
            <li>Email</li>
          </ul>
        </ExpandableCard>
      </div>
    </div>
  );
};

export default Test;
