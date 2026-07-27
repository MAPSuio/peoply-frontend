// Next.js.
import type { NextPage } from "next";
import dynamic from "next/dynamic";

// Components.
import GlobalSearch from "../components/GlobalSearch";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";
import Navbar from "../components/Navbar";

// Styles.
/* Same split as pages/index.tsx: the carousels cannot render before their data
   arrives, so Swiper's JS stays lazy with the Recommendations chunk, while its
   CSS is imported eagerly here so it is present at first paint. */
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";

import styles from "../styles/Find.module.scss";

const Recommendations = dynamic(() => import("../components/Recommendations"), {
  ssr: false,
});

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
