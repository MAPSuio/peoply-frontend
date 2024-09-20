import BackButton from "../components/BackButton";
import ExpandableCard from "../components/ExpandableCard";
import HeadComponent from "../components/HeadComponent";
import useBack from "../hooks/useBack";

import styles from "../styles/FAQ.module.scss";

interface FAQProps {
  baseUrl: string;
}

const FAQ = ({ baseUrl }: FAQProps) => {
  const goBack = useBack();

  return (
    <>
      <HeadComponent
        title="FAQ"
        description="Spørsmål og kontakt"
        url={`${baseUrl}/faq`}
      />
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
                    finner du de forskjellige datatypene og nøyaktig hva de
                    brukes til:
                  </p>
                  <ul>
                    <li className={styles.marginBottomVerySmall}>
                      <span className={styles.emphasis}>
                        Fornavn og etternavn
                      </span>
                      <ul className={styles.reducedPadding}>
                        <li>
                          Brukes for å identifisere deg i appen for andre
                          brukere.
                        </li>
                      </ul>
                    </li>
                    <li className={styles.marginBottomVerySmall}>
                      <span className={styles.emphasis}>Telefonnummer</span>
                      <ul className={styles.reducedPadding}>
                        <li>Brukes for å identifisere deg i systemet vårt.</li>
                        {/* <li>Brukes for å sende deg SMS varslinger.</li> */}
                      </ul>
                    </li>
                    <li className={styles.marginBottomVerySmall}>
                      <span className={styles.emphasis}>Fødselsdato</span>
                      <ul className={styles.reducedPadding}>
                        <li>
                          Brukes for å verifisere alderen din på arrangementer
                          med aldersgrense.
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
                    Peoply er en veldig sikker plattform. Du kan være trygg på
                    at vi behandler dataene dine med omhu. De viktigste
                    sikkerhetstiltakene våre er listet nedenfor:
                  </p>
                  <ul>
                    <li className={styles.marginBottomVerySmall}>
                      <span className={styles.emphasis}>
                        Vi bruker bare Vipps og Google logg inn
                      </span>
                      <ul className={styles.reducedPadding}>
                        <li>
                          Dette gjør at du kan være trygg på at alle brukere i
                          appen er ekte.
                        </li>
                        <li>
                          Dette gjør at vi bare henter noen av dataene du
                          allerede har valgt å lagre i Vipps eller Google.
                        </li>
                        <li>
                          Dette gjør at vi kan være sikre på at dataene vi
                          henter er verifiserbare og godkjent av Vipps eller
                          Google.
                        </li>
                      </ul>
                    </li>
                    <li className={styles.marginBottomVerySmall}>
                      <span className={styles.emphasis}>
                        Vi lagrer og prosesserer all data i Norge.
                      </span>
                      <ul className={styles.reducedPadding}>
                        <li>
                          All data og kode som kjøres på plattformen vår
                          behandles og lagres i Norge.
                        </li>
                        <li>
                          Dette gjør også at plattformen vår kan føles litt
                          raskere enn andre som f.eks. befinner seg i USA.
                        </li>
                        <li>
                          For de litt mer teknisk interesserte, så har vi valgt
                          å benytte oss av Azure skytjeneste for hosting av
                          frontend- og backend-kode og database. Dette er i
                          skrivende stund den eneste skytjenesten som har
                          servere i Norge.
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
                          Dette gjør at mange av komponentene du interreagerer
                          med på plattformen ikke trenger å kjøres på en server.
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
                <ExpandableCard title="Kan andre se at jeg har meldt meg på et arrangement?">
                  <p>
                    Kun arrangøren kan se at du er deltaker på et arrangement.
                  </p>
                </ExpandableCard>
                <ExpandableCard title="Hva skjer hvis det ikke er noen ledige plasser på et arrangement?">
                  <p>
                    Hvis det ikke er noen ledige plasser på et arrangement, vil
                    knappen for å melde seg på arrangementet endre seg for å
                    reflektere dette.
                  </p>
                  <p>
                    Hvis du velger å melde deg på arrangementet allikevel, vil
                    du automatisk bli satt på en venteliste. Skulle noen andre
                    melde seg av, vil du rykke opp i køen og evt. få en plass.
                  </p>
                </ExpandableCard>
              </div>
            </div>
            <div className={styles.section}>
              <h2 className={styles.sectionHeader}>Kontakt</h2>
              <div className={styles.cardContainer}>
                <p className={styles.contactText}>
                  Har du har et problem med appen, et spørsmål som ikke er
                  besvart ovenfor, eller et forslag til en potensiell forbedring
                  av tjenesten? Ta gjerne kontakt med oss på ved hjelp av
                  kontaktinformasjonen nedenfor.
                </p>
              </div>
            </div>
            <div className={styles.section}>
              <span className={styles.divider} />
              <p className={styles.infoText}>MAPS</p>
              <p className={styles.infoText}>Orgnr: 995 251 884</p>
              <p className={styles.infoText}>
                Adresse: Postboks 1080 Blindern, 0316 Oslo
              </p>
              <p className={styles.infoText}>Tlfnummer: 904 76 675</p>
              <p className={styles.infoText}>
                Email: maps-kontakt@studorg.uio.no
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return {
    props: {
      baseUrl,
    },
  };
};

export default FAQ;
