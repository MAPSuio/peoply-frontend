import styles from "../../styles/Organizations.module.scss";
import type { NextPage } from "next";
import useUser from "../../hooks/useUser";
import BackButton from "../../components/BackButton";
import useBack from "../../hooks/useBack";
import OrgImage from "../../assets/images/undraw_apartment.png";
import Image from "next/legacy/image";
import router from "next/router";
import Button from "../../components/Button";

import OrgList from "../../components/OrgList";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import Navbar from "../../components/Navbar";
import HeadComponent from "../../components/HeadComponent";

const Organizations: NextPage = () => {
  const { user, loading, orgs } = useUser();
  const goBack = useBack();
  const redirectToLogin = useRedirectToLogin();

  if (loading) {
    return <></>;
  }

  if (!loading && !user) {
    redirectToLogin();
  }

  /* return div with class container */
  if (!loading && user) {
    return (
      <>
        <HeadComponent
          title="Mine organisasjoner"
          description="Her kan du se dine organisasjoner"
        />
        <div className={styles.container}>
          <BackButton onClick={goBack} />
          <div className={styles.header}>
            <h1>Organisasjoner</h1>
            <p>Se og endre dine organisasjoner</p>
          </div>
          {orgs?.length ? (
            <OrgList orgs={orgs} />
          ) : (
            <>
              <div className={styles.imageContainer}>
                <Image
                  src={OrgImage}
                  alt="Bilde av bedriftslokaler"
                  placeholder="blur"
                />
              </div>
              <div className={styles.subheader}>
                <h2>Ingen organisasjoner funnet</h2>
                <p>Kom i gang ved å opprette en organisasjon da vel!</p>
              </div>
              <div className={styles.confirm}>
                <Button
                  text="Opprett organisasjon"
                  onClick={() => router.push("/orgs/create")}
                />
              </div>
            </>
          )}
        </div>
        <Navbar />
      </>
    );
  }
  return <></>;
};

export default Organizations;
