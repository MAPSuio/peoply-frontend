import { NextPage } from "next";
import BackButton from "../components/BackButton";
import ExpandableCard from "../components/ExpandableCard";
import useBack from "../hooks/useBack";

import styles from "../styles/Support.module.scss";

const Support: NextPage = () => {
  const goBack = useBack();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <BackButton onClick={goBack} className={styles.marginBottomMedium} />
        <h1 className={styles.title}>Spørsmål og kontakt</h1>
        <p className={styles.subTitle}>Hva ønsker du svar på?</p>
        <div className={styles.sectionContainer}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeader}>Personvern</h2>
            <div className={styles.cardContainer}>
              <ExpandableCard title="Hvilke data lagrer Peoply?">
                <p>
                  Peoply lagrer kun persondataen som kommer fra innloggingen
                  gjennom Vipps. Dette inkluderer:
                </p>
                <ul>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>Fornavn</span>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>Etternavn</span>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>Telefonnummer</span>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>Fødselsdato</span>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>Email</span>
                  </li>
                </ul>
              </ExpandableCard>
              <ExpandableCard title="Hva brukes dataene til?">
                <p>
                  Hva dataene brukes til er avhengig av typen data. Nedenfor
                  finner du de forskjellige datatypene og nøyaktig hva de brukes
                  til:
                </p>
                <ul>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>
                      Fornavn og etternavn
                    </span>
                    <ul className={styles.reducedPadding}>
                      <li>
                        Brukes for å identifisere deg i appen for andre brukere.
                      </li>
                    </ul>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>Telefonnummer</span>
                    <ul className={styles.reducedPadding}>
                      <li>Brukes for å identifisere deg i systemet vårt.</li>
                      <li>Brukes for å sende deg SMS varslinger.</li>
                    </ul>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>Fødselsdato</span>
                    <ul className={styles.reducedPadding}>
                      <li>
                        Brukes for å verifisere alderen din på arrangementer med
                        aldersgrense.
                      </li>
                    </ul>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>Email</span>
                    <ul className={styles.reducedPadding}>
                      <li>Brukes for å sende deg email varslinger.</li>
                    </ul>
                  </li>
                </ul>
              </ExpandableCard>
              <ExpandableCard title="Hvilke sikkerhetstiltak har Peoply?">
                <p>
                  Peoply er en veldig sikker plattform. Du kan være trygg på at
                  vi behandler dataene dine med omhu. De viktigste
                  sikkerhetstiltakene våre er listet nedenfor:
                </p>
                <ul>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>
                      Vi bruker bare Vipps logg inn
                    </span>
                    <ul className={styles.reducedPadding}>
                      <li>
                        Dette gjør at du kan være trygg på at alle brukere i
                        appen er ekte.
                      </li>
                      <li>
                        Dette gjør at vi bare henter de dataene du allerede har
                        valgt å lagre i Vipps.
                      </li>
                      <li>
                        Dette gjør at vi kan være sikre på at dataene vi henter
                        er verifiserbare og godkjent av Vipps.
                      </li>
                    </ul>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>
                      Vi lagrer og prosesseserer all data i Norge.
                    </span>
                    <ul className={styles.reducedPadding}>
                      <li>
                        All data og kode som kjøres på plattformen vår behandles
                        og lagres i Norge.
                      </li>
                      <li>
                        Dette gjør også at plattformen vår kan føles litt
                        raskere enn andre som f.eks. befinner seg i USA.
                      </li>
                      <li>
                        For de litt mer teknisk intereserte, så har vi valgt å
                        benytte oss av Azure skytjenesten for hosting av
                        frontend- og backend-kode og database. Dette er i
                        skrivende stund den eneste skytjenesten som har servere
                        i Norge.
                      </li>
                    </ul>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>
                      Vi bruker bare de nyeste og beste teknologiene.
                    </span>
                    <ul className={styles.reducedPadding}>
                      <li>
                        Dette gjør at de fleste sikkerhetshull enten har blitt
                        tettet eller ikke eksisterer lengre.
                      </li>
                      <li>
                        Dette gjør at mange av komponentene du interreagerer med
                        på plattformen ikke trenger å kjøres på en server.
                      </li>
                      <li>
                        Dette gjør at vi kan føle oss trygge på at vi leverer
                        den beste og raskeste opplevelsen for deg som bruker.
                      </li>
                    </ul>
                  </li>
                </ul>
              </ExpandableCard>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionHeader}>Arrangementer</h2>
            <div className={styles.cardContainer}>
              <ExpandableCard title="Hvordan melde seg på et arrangement?">
                <p>
                  For å melde deg på et arrangement må du være logget inn i
                  appen. Hvordan dette gjøres, beskrives under kategorien
                  “innlogging”.
                </p>
                <p>
                  Etter du har logget inn kan du navigere til et arrangement i
                  appen. Etter du har kommet inn på arrangementsiden kan du
                  enkelt trykke på “Meld deg på arrangementet”.
                </p>
              </ExpandableCard>
              <ExpandableCard title="Kan andre se at jeg har meldt meg på et gitt arrangement?">
                <p>
                  De du valgt å være venner med kan se hvilke arrangementer du
                  har meldt deg på. Hvis du ønsker å endre på dette, kan du
                  enkelt skru det av i innstillinger, under kategorien
                  “personvern og sikkerhet”.
                </p>
              </ExpandableCard>
              <ExpandableCard title="Hva skjer hvis jeg er påmeldt et arrangement og ikke møter?">
                <p>
                  Hva som skjer hvis du ikke møter opp på et arrangement du er
                  påmeldt, vil være avhengig av hvilken type arrangement det er,
                  og hva arrangøren har bestemt for det arrangementet.
                </p>
                <p>
                  Arrangøren vil ha mulighet dele ut en form for “straff” ved
                  manglende oppmøte. Hva slags straff dette typisk kan være, er
                  listet nedenfor:
                </p>
                <ul>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>
                      Du vil være sperret fra å delta på arrangementer fra den
                      arrangøren i en viss periode.
                    </span>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>
                      Du vil måtte betale en pengestraff.
                    </span>
                  </li>
                  <li className={styles.marginBottomVerySmall}>
                    <span className={styles.emphasis}>
                      Du vil ikke ha mulighet for å delta på noen arrangementer
                      i appen i en periode.
                    </span>
                    <ul className={styles.reducedPadding}>
                      <li>
                        Dette vil bare være aktuelt hvis vi mistenker eller
                        oppdager grovt misbruk.
                      </li>
                    </ul>
                  </li>
                </ul>
              </ExpandableCard>
              <ExpandableCard title="Hva skjer hvis det ikke er noen ledige plasser på et arrangement?">
                <p>
                  Hvis det ikke er noen ledige plasser på et arrangement, vil
                  knappen for å melde seg på arrangementet endre seg for å
                  reflektere dette.
                </p>
                <p>
                  Hvis du velger å melde deg på arrangementet allikevel, vil du
                  automatisk bli satt på en venteliste. Skulle noen andre melde
                  seg av, vil du rykke opp i køen og evt. få en plass. Hvis du
                  får en plass, vil du få beskjed om dette på SMS.
                </p>
              </ExpandableCard>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionHeader}>Betaling</h2>
            <div className={styles.cardContainer}>
              <ExpandableCard title="Hvilke betalingsmetoder støttes i appen?">
                <p>
                  Peoply støtter bare Vipps betaling. Vi har valgt dette som
                  betalingsmetode fordi det er trygt, enkelt og raskt for deg
                  som bruker.
                </p>
                <p>
                  Vi antar at alle brukere har Vipps, dersom dette er eneste
                  godkjente innloggingsmetode.
                </p>
              </ExpandableCard>
              <ExpandableCard title="Hvordan håndteres refusjoner ved avlyste arrangementer?">
                <p>
                  Hvis det skulle være aktuelt med refusjon på et avlyst betalt
                  arrangement, vil du automatisk få tilbake summen du betalte
                  for å delta på arrangementet.
                </p>
                <p>Dette vil typisk skje innen 14 arbeidsdager.</p>
              </ExpandableCard>
              <ExpandableCard title="Er det gratis for meg som arrangør å ta betaling gjennom appen deres?">
                <p>
                  Det er så og si gratis for deg som arrangør å la oss håndtere
                  betalinger.
                </p>
                <p>
                  Siden Vipps tar en liten prosentandel av alle betalinger, har
                  vi valgt å sette betalingsavgiften til 5%. Dette gjør at
                  Peoply får 2% fortjeneste på alle betalte arrangementer. En
                  ekstremt rettferdig sum, ifølge oss selv 😉
                </p>
              </ExpandableCard>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionHeader}>Kontakt</h2>
            <div className={styles.cardContainer}>
              <p className={styles.contactText}>
                Har du har et problem med appen, et spørsmål som ikke er besvart
                ovenfor, eller et forslag til en potensiell forbedring av
                tjenesten? Ta gjerne kontakt med oss på{" "}
                <a className={styles.emailLink}>peoply@decidable.no</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
