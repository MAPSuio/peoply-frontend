/* Next. */
import { NextPage } from "next";
import { useRouter } from "next/router";

/* Hooks. */
import useUser from "../../hooks/useUser";

/* Components. */
import BackButton from "../../components/BackButton";

/* Styles. */
import styles from "../../styles/Settings.module.scss";
import useBack from "../../hooks/useBack";

const Settings: NextPage = () => {
  const { user, loading } = useUser();
  const goBack = useBack();
  const router = useRouter();

  if (loading) {
    /* TODO: Create actual loading skeleton. */
    return <h1>Loading...</h1>;
  } else if (!user) {
    router.push("/login");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <BackButton onClick={goBack} className={styles.marginBottomMedium} />
        <h1 className={styles.title}>Innstillinger</h1>
        <p className={styles.description}>
          Tilpass appen etter dine ønsker og behov
        </p>
      </div>
    </div>
  );
};

export default Settings;
