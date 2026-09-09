import type { NextPage } from "next";
import { useState } from "react";

import BackButton from "../../components/BackButton";
import HeadComponent from "../../components/HeadComponent";
import InfoCard from "../../components/InfoCard";
import RequireUser from "../../components/RequireUser";
import NumberInput from "../../components/inputs/NumberInput";
import useBack from "../../hooks/useBack";

import styles from "../../styles/admin.module.scss";

const MAX_DAYS = 1000;

const STAT_CARDS = [
  { title: "Nye brukere", resource: "new-users" },
  { title: "Nye arrangementer", resource: "new-events" },
  { title: "Aktiviteter", resource: "new-registrations" },
  { title: "Nye Organisasjoner", resource: "new-orgs" },
  { title: "Nye Favoriseringer", resource: "new-favorites" },
];

function statsEndpoint(resource: string, days: string) {
  const withinBounds = days !== "" && !(parseInt(days, 10) > MAX_DAYS);
  return `/moderation/info/${resource}?days=${withinBounds ? days : 0}`;
}

const StatsPanel = () => {
  const goBack = useBack();
  const [days, setDays] = useState("7");

  return (
    <>
      <HeadComponent
        title="Admin panel"
        description="Overordnet informasjon om Peoply"
      />
      <div className={styles.container}>
        <BackButton onClick={goBack} />

        <div className={styles.input}>
          <h1>Hvordan går det med Peoply</h1>
          <NumberInput
            value={days}
            max={`${MAX_DAYS}`}
            min={"0"}
            inputId={"0"}
            inputName={"a"}
            label={"Antall dager"}
            placeholder={""}
            errorMessage={`oppgi et tall mellom 1 og ${MAX_DAYS}`}
            handleChange={(e) => setDays(e.target.value)}
          />
        </div>

        <div className={styles.cardContainer}>
          {STAT_CARDS.map(({ title, resource }) => (
            <InfoCard
              key={resource}
              title={title}
              endpoint={statsEndpoint(resource, days)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const Stats: NextPage = () => <RequireUser>{() => <StatsPanel />}</RequireUser>;

export default Stats;
