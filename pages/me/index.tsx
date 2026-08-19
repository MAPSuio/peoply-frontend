import type { NextPage } from "next";

import ProfileOverview from "../../components/ProfileOverview";
import useUser from "../../hooks/useUser";
import styles from "../../styles/me.module.scss";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import BackButton from "../../components/BackButton";
import useBack from "../../hooks/useBack";
import HeadComponent from "../../components/HeadComponent";

/* The avatar in the header opens the same content in a panel. This route is
   kept for deep links and for the app shortcut in the manifest. */
const Me: NextPage = () => {
  const { user, loading } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const goBack = useBack();

  if (loading) {
    return <></>;
  }

  if (!loading && !user) {
    redirectToLogin();
    return <></>;
  }

  if (!loading && user) {
    return (
      <>
        <HeadComponent
          title="Min profil"
          description="Her kan du se og endre din profil"
        />
        <div className={styles.container}>
          <BackButton onClick={goBack} />
          <ProfileOverview user={user} />
        </div>
      </>
    );
  }

  return <></>;
};

export default Me;
