import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/legacy/image";
import Link from "../components/Link";
import Button from "../components/Button";
import styles from "../styles/Offline.module.scss";
import ErrorImage from "../assets/images/undraw_404.png";

const Offline: NextPage = () => {
  return (
    <>
      <Head>
        <title>Du er offline</title>
      </Head>
      <div className={styles.offlineWrapper}>
        <div className={styles.offlineContainer}>
          <div className={styles.offlineHeaderContainer}>
            <h1>Du er offline</h1>
            <p>
              Koble til internett for å nå denne siden. Sidene du allerede har
              besøkt vil fortsette å fungere, men innholdet kan være utdatert
            </p>
          </div>
          <div className={styles.imageContainer}>
            <Image
              src={ErrorImage}
              alt="En alien som blir tatt av et romskip"
            />
          </div>
          <Link href="/" className={styles.a}>
            <Button text="Gå til hjemskjermen" className={styles.homeButton} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Offline;
