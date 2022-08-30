import { NextPage } from "next";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";
import GlobalSearch from "../components/GlobalSearch";

import styles from "../styles/Find.module.scss";
import Navbar from "../components/Navbar";

const Find: NextPage = () => {
  return (
    <>
      <HeadComponent
        title="Finn"
        description="Finn arrangementer og organisasjoner"
      />
      <Header />
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1>Finn</h1>
          <p>Finn arrangementer og organisasjoner</p>
        </div>
        <div className={styles.container}>
          <GlobalSearch />
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default Find;
