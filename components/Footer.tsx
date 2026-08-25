// Components.
import ApiIcon from "./svgs/ApiIcon";
import GithubIcon from "./svgs/GithubIcon";
import MapsLogo from "./svgs/MapsLogo";
import Link from "./Link";

// Utils.
import { mapsUrl, sourceCodeUrl } from "../utils/constants";

// Styles.
import styles from "../styles/Footer.module.scss";

/**
 * Maintainer-byline for forsiden: hvem som drifter Peoply, og hvor
 * kildekoden bor. Rendres kun på forsiden - undersider skal ikke bære
 * footer-vekt i en feed-app.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a
        href={mapsUrl}
        className={styles.maintainer}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Drevet av</span>
        <MapsLogo className={styles.mapsLogo} />
      </a>
      <div className={styles.links}>
        <a
          href={sourceCodeUrl}
          className={styles.sourceLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubIcon className={styles.githubIcon} />
          <span>Kildekode på GitHub</span>
        </a>
        <Link href="/integrasjoner" className={styles.sourceLink}>
          <ApiIcon className={styles.apiIcon} />
          <span>API for utviklere</span>
        </Link>
      </div>
    </footer>
  );
}
