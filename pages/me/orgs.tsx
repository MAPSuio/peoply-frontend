import styles from "../../styles/Organizations.module.scss";
import { NextPage } from "next";
import useUser from "../../hooks/useUser";
import BackButton from "../../components/BackButton";
import useBack from "../../hooks/useBack";
import OrgImage from "../../assets/images/undraw_apartment.png";
import Image from "next/image";
import router from "next/router";
import PrimaryButton from "../../components/PrimaryButton";
import useSWR from "swr";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import OrgList from "../../components/OrgList";

const Organizations: NextPage = () => {
  const { user, loading } = useUser();
  const goBack = useBack();

  /* fetch organizations for user using swr hook */
  const { data, error } = useSWR(
    `/users/${user?.id}/organizations`,
    fetchFromPeoplyApiJson,
  );

  if (error) {
    if (error.status === 401) {
      router.push("/login");
    }
  }

  if (loading) {
    return <></>;
  }

  if (!loading && !user) {
    router.push("/login");
  }

  /* return div with class container */
  if (!loading && user) {
    return (
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.header}>
          <h1>Organisasjoner</h1>
          <p>Se og endre dine organisasjoner</p>
        </div>
        {data && data.length ? (
          <OrgList orgs={data} />
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
              <p>Kom i gang ved å opprette en organisajon da vel!</p>
            </div>
            <div className={styles.confirm}>
              <PrimaryButton
                text="Opprett organisasjon"
                onClick={() => router.push("/orgs/create")}
              />
            </div>
          </>
        )}
      </div>
    );
  }
  return <></>;
};

export default Organizations;
