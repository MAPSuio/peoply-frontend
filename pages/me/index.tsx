import type { NextPage } from "next";

import ProfileOverview from "../../components/ProfileOverview";
import styles from "../../styles/me.module.scss";
import RequireUser from "../../components/RequireUser";
import BackButton from "../../components/BackButton";
import useBack from "../../hooks/useBack";
import HeadComponent from "../../components/HeadComponent";
import type { User } from "../../types/types";

const Profile = ({ user }: { user: User }) => {
  const goBack = useBack();

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
};

/* The avatar in the header opens the same content in a panel. This route is
   kept for deep links and for the app shortcut in the manifest. */
const Me: NextPage = () => (
  <RequireUser>{(user) => <Profile user={user} />}</RequireUser>
);

export default Me;
