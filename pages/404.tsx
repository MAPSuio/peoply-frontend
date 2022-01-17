import { NextPage } from "next";
import Image from "next/image";

import ConfirmButton from "../components/ConfirmButton";
import ErrorImage from "../assets/images/undraw_404.png";

import useHome from "../hooks/useHome";

import styles from "../styles/Custom404.module.scss";

const Custom404: NextPage = () => {
  const goHome = useHome();

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
        <ConfirmButton
          onClick={goHome}
          text="Gå til hjemskjermen"
          className={styles.homeButton}
        />
      </div>
    </div>
  );
};

export default Custom404;
