// Components.
import ApiIcon from "./svgs/ApiIcon";
import GithubIcon from "./svgs/GithubIcon";
import HelpCircleIcon from "./svgs/HelpCircleIcon";
import MapsLogo from "./svgs/MapsLogo";
import Link from "./Link";

// Utils.
import {
  mapsAddress,
  mapsBrregUrl,
  mapsContactEmail,
  mapsOrganizationName,
  mapsOrgNumber,
  mapsUrl,
  sourceCodeUrl,
} from "../utils/constants";

// Styles.
import styles from "../styles/Footer.module.scss";

/**
 * Maintainer-byline for forsiden: hvem som drifter Peoply, juridisk
 * foretaksinformasjon (Vipps Login / e-handelsloven) og nyttige lenker.
 * Rendres på forsiden for oversikt og compliance.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <a
            href={mapsUrl}
            className={styles.maintainer}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.maintainerPrefix}>Drevet av</span>
            <MapsLogo className={styles.mapsLogo} />
          </a>
          <p className={styles.orgFullName}>{mapsOrganizationName}</p>
        </div>

        <div className={styles.legalInfo}>
          <div className={styles.infoPill}>
            <span className={styles.infoLabel}>Org.nr</span>
            <a
              href={mapsBrregUrl}
              className={styles.infoLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Organisasjonsnummer ${mapsOrgNumber} i Brønnøysundregistrene`}
            >
              {mapsOrgNumber}
            </a>
          </div>
          <div className={styles.infoPill}>
            <span className={styles.infoLabel}>Kontakt</span>
            <a
              href={`mailto:${mapsContactEmail}`}
              className={styles.infoLink}
              aria-label={`Send e-post til ${mapsContactEmail}`}
            >
              {mapsContactEmail}
            </a>
          </div>
          <div className={styles.infoPill}>
            <span className={styles.infoLabel}>Adresse</span>
            <span className={styles.infoValue}>{mapsAddress}</span>
          </div>
        </div>

        <div className={styles.links}>
          <Link href="/faq" className={styles.sourceLink}>
            <HelpCircleIcon className={styles.linkIcon} />
            <span>Spørsmål og kontakt</span>
          </Link>
          <Link href="/integrasjoner" className={styles.sourceLink}>
            <ApiIcon className={styles.linkIcon} />
            <span>API for utviklere</span>
          </Link>
          <a
            href={sourceCodeUrl}
            className={styles.sourceLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className={styles.linkIcon} />
            <span>Kildekode på GitHub</span>
          </a>
        </div>

        <p className={styles.copyright}>
          Studentdrevet arrangementsplattform for Universitetet i Oslo
        </p>
      </div>
    </footer>
  );
}
