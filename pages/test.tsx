import { NextPage } from "next";
import { useState } from "react";
import useSWR from "swr";
import ExpandableCard from "../components/ExpandableCard";
import CheckboxInput from "../components/inputs/CheckboxInput";
import Modal from "../components/Modal";
import MyEventCard from "../components/MyEventCard";
import SettingsButton from "../components/SettingsButton";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import styles from "../styles/Test.module.scss";

const Test: NextPage = () => {
  /* Fetch test event. */
  const { data: event, error: eventError } = useSWR(
    "/events/1",
    fetchFromPeoplyApiJson,
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
        <Modal
          label="Her kommer tittel"
          description="In maiores voluptatem rerum ut nemo ipsa ut omnis. Ut cupiditate consequatur qui quo. Sunt ea illo facere. Fuga veritatis nisi ut. Adipisci autem quia quisquam mollitia ut minima nobis. Quia et aperiam dolorem."
          buttonText="Her kommer det en action"
          buttonOnClick={() => console.log("Her kommer gutta")}
        />
      </div>
    </div>
  );
};

export default Test;
