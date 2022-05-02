import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

import Button from "../components/Button";
import ErrorImage from "../assets/images/undraw_404.png";

import styles from "../styles/Custom404.module.scss";

const Custom404: NextPage = () => {
  return (
    <div className={styles.errorWrapper}>
      <div className={styles.errorContainer}>
        <div className={styles.errorHeaderContainer}>
          <h1>Oisann! Her skjedde det visst en feil.</h1>
          <p>Vi kunne ikke finne siden du leter etter.</p>
        </div>
        <div className={styles.imageContainer}>
          <Image
            src={ErrorImage}
            alt="En alien som blir tatt av et romskip"
            placeholder="blur"
          />
        </div>
        <Link href="/">
          <a className={styles.a}>
            <Button
              isLink
              text="Gå til hjemskjermen"
              className={styles.homeButton}
            />
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Custom404;
