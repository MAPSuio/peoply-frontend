import Link from "next/link";

import BackButton from "../components/BackButton";
import HeadComponent from "../components/HeadComponent";
import Navbar from "../components/Navbar";
import useBack from "../hooks/useBack";

import styles from "../styles/Integrasjoner.module.scss";

interface IntegrasjonerProps {
  apiUrl: string;
  baseUrl: string;
}

const Integrasjoner = ({ apiUrl, baseUrl }: IntegrasjonerProps) => {
  const goBack = useBack();
  const docsUrl = apiUrl ? `${apiUrl}/api` : undefined;

  return (
    <>
      <HeadComponent
        title="Integrasjoner"
        description="Hvordan du kan integrere med Peoply API-et"
        url={baseUrl ? `${baseUrl}/integrasjoner` : undefined}
      />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <BackButton onClick={goBack} className={styles.backButton} />
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Integrasjoner</p>
            <h1 className={styles.title}>Bygg mot Peoply API-et</h1>
            <p className={styles.lead}>
              Peoply kan brukes som datakilde for arrangementer, foreninger og
              innlogging. Hvis du vil lage en egen klient, infoskjerm eller en
              intern tjeneste, starter du med API-dokumentasjonen.
            </p>
            <div className={styles.ctaRow}>
              {docsUrl && (
                <a
                  className={styles.primaryLink}
                  href={docsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Åpne API-dokumentasjon
                </a>
              )}
              {apiUrl && <p className={styles.apiBase}>Base URL: `{apiUrl}`</p>}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Slik kommer du i gang</h2>
            <div className={styles.cardGrid}>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>1. Utforsk endepunktene</h3>
                <p>
                  Swagger-dokumentasjonen viser request/response-modeller,
                  query-parametre og hvilke endepunkter som krever innlogging.
                </p>
              </article>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>2. Start med lesetilgang</h3>
                <p>
                  De fleste integrasjoner begynner med å hente arrangementer og
                  organisasjoner. Det gir deg en trygg read-only start.
                </p>
              </article>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>3. Legg til auth ved behov</h3>
                <p>
                  Hvis du trenger personaliserte data, må brukeren logge inn via
                  Peoplys autentiseringsflyt og sende cookies videre i kallene.
                </p>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Bra å vite</h2>
            <div className={styles.noteCard}>
              <ul className={styles.noteList}>
                <li>Respekter at noen endepunkter krever autentisering.</li>
                <li>Cache read-only data der det gir mening.</li>
                <li>Bygg mot stabile id-er og ikke kun visningstekst.</li>
                <li>
                  Bruk API-dokumentasjonen som kilde for felter og kontrakter.
                </li>
              </ul>
              {docsUrl && (
                <p>
                  Trenger du detaljene? Se hele dokumentasjonen i{" "}
                  <a href={docsUrl} target="_blank" rel="noreferrer">
                    API-dokumentasjonen
                  </a>
                  .
                </p>
              )}
              <p>
                For produktspørsmål eller tilgangsbehov kan du også lese mer på{" "}
                <Link href="/faq">FAQ-siden</Link>.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Autentisering for beskyttede endepunkter
            </h2>
            <div className={`${styles.cardGrid} ${styles.authCardGrid}`}>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>1. Send brukeren til login</h3>
                <p>
                  Beskyttede endepunkter krever at brukeren logger inn via
                  Peoplys eksisterende innlogging hos{" "}
                  <code>https://api.peoply.app/auth/login</code>.
                </p>
              </article>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>2. Bruk cookies videre</h3>
                <p>
                  Etter vellykket innlogging setter backend auth-cookies. Videre
                  kall til beskyttede endepunkter må derfor sendes med
                  `credentials: include`, akkurat som frontend gjør i dag.
                </p>
              </article>
              <article className={styles.card}>
                <h3 className={styles.cardTitle}>3. Håndter utløp</h3>
                <p>
                  Hvis et kall svarer `401`, må klienten fornye sesjonen via
                  `POST https://api.peoply.app/auth/refresh` og deretter prøve
                  requesten igjen.
                </p>
              </article>
            </div>
            <div className={styles.noteCard}>
              <p>
                Kort fortalt: offentlige endepunkter kan leses direkte, mens
                beskyttede endepunkter krever Peoply-login, auth-cookies og
                refresh-flyt ved `401`.
              </p>
              {docsUrl && (
                <p>
                  Se hvilke endepunkter som er beskyttet og hvilke felter som
                  kreves i{" "}
                  <a href={docsUrl} target="_blank" rel="noreferrer">
                    API-dokumentasjonen
                  </a>
                  .
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
      <Navbar />
    </>
  );
};

export const getStaticProps = async () => {
  return {
    props: {
      apiUrl: "https://api.peoply.app",
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "",
    },
  };
};

export default Integrasjoner;
