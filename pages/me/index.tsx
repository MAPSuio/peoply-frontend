import { NextPage } from "next";

import Avatar from "../../components/Avatar";

import ProfileMenu from "../../components/ProfileMenu";
import useUser from "../../hooks/useUser";
import styles from "../../styles/me.module.scss";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import OrgMenu from "../../components/OrgMenu";
import Navbar from "../../components/Navbar";

const Me: NextPage = () => {
  const { user, currentOrg, loading } = useUser();

  const redirectToLogin = useRedirectToLogin();

  if (loading) {
    return <></>;
  }

  if (!loading && !user) {
    redirectToLogin();
  }

  if (!loading && user && currentOrg) {
    return (
      <div className={styles.container}>
        <div className={styles.profile}>
          <Avatar user={user} org={currentOrg} size="large" />
          <h1 className={styles.name}>{`${currentOrg.name}`}</h1>
          <p className={styles.location}>Oslo, NO</p>
          <p className={styles.description}>{currentOrg.description}</p>
        </div>
        <OrgMenu />
        <Navbar />
      </div>
    );
  }

  if (!loading && user) {
    return (
      <div className={styles.container}>
        <div className={styles.profile}>
          <Avatar user={user} size="large" />
          <h1
            className={styles.name}
          >{`${user.firstName} ${user.lastName}`}</h1>
          <p className={styles.location}>Oslo, NO</p>
          <p className={styles.description}>{user.description}</p>
        </div>
        <ProfileMenu />
        <Navbar />
      </div>
    );
  }

  return <></>;
};

export default Me;
