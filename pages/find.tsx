import { NextPage } from "next";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";
import GlobalSearch from "../components/GlobalSearch";

import styles from "../styles/Find.module.scss";
import BackButton from "../components/BackButton";
import useBack from "../hooks/useBack";

const Find: NextPage = () => {
  const goBack = useBack();
  return (
    <>
      <HeadComponent
        title="Peoply - Finn"
        description="Finn arrangementer og organisasjoner"
      />
      <Header />
      <div className={styles.wrapper}>
        <BackButton className={styles.back} onClick={goBack} />
        <div className={styles.header}>
          <h1>Finn</h1>
          <p>Finn arrangementer og organisasjoner</p>
        </div>
        <div className={styles.container}>
          <GlobalSearch />
        </div>
      </div>
    </>
  );
};

export default Find;
