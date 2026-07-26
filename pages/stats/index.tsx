import type { NextPage } from "next";

import useUser from "../../hooks/useUser";
import styles from "../../styles/admin.module.scss";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import BackButton from "../../components/BackButton";
import useBack from "../../hooks/useBack";
import HeadComponent from "../../components/HeadComponent";
import InfoCard from "../../components/InfoCard";
import NumberInput from "../../components/inputs/NumberInput";
import { useState } from "react";

const Stats: NextPage = () => {
  const { user, loading } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const goBack = useBack();
  const [days, setDays] = useState("7");

  if (loading) {
    return <></>;
  }

  if (!loading && !user) {
    redirectToLogin();
    return <></>;
  }

  if (!loading && user) {
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
              value={`${days}`}
              max={"1000"}
              min={"0"}
              inputId={"0"}
              inputName={"a"}
              label={"Antall dager"}
              placeholder={""}
              errorMessage={"oppgi et tall mellom 1 og 1000"}
              handleChange={(e) => {
                setDays(e.target.value);
              }}
            />
          </div>

          <div className={styles.cardContainer}>
            <InfoCard
              title={"Nye brukere"}
              endpoint={
                "/moderation/info/new-users?days=" +
                (days === "" || parseInt(days, 10) > 1000 ? 0 : days)
              }
            />
            <InfoCard
              title={"Nye arrangementer"}
              endpoint={
                "/moderation/info/new-events?days=" +
                (days === "" || parseInt(days, 10) > 1000 ? 0 : days)
              }
            />
            <InfoCard
              title={"Aktiviteter"}
              endpoint={
                "/moderation/info/new-registrations?days=" +
                (days === "" || parseInt(days, 10) > 1000 ? 0 : days)
              }
            />
            <InfoCard
              title={"Nye Organisasjoner"}
              endpoint={
                "/moderation/info/new-orgs?days=" +
                (days === "" || parseInt(days, 10) > 1000 ? 0 : days)
              }
            />

            <InfoCard
              title={"Nye Favoriseringer"}
              endpoint={
                "/moderation/info/new-favorites?days=" +
                (days === "" || parseInt(days, 10) > 1000 ? 0 : days)
              }
            />
          </div>
        </div>
      </>
    );
  }

  return <></>;
};

export default Stats;
