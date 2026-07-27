// Next.js.
import type { NextPage } from "next";

// Components.
import GlobalSearch from "../components/GlobalSearch";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Recommendations from "../components/Recommendations";

// Styles.
import styles from "../styles/Find.module.scss";

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
        <Recommendations />
      </div>
      <Navbar />
    </>
  );
};

export default Find;
