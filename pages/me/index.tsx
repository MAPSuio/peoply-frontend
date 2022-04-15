import { NextPage } from "next";
import { useRouter } from "next/router";
import useBack from "../../hooks/useBack";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
import ProfileMenu from "../../components/ProfileMenu";
import useUser from "../../hooks/useUser";
import styles from "../../styles/me.module.scss";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import OrgMenu from "../../components/OrgMenu";

const Me: NextPage = () => {
  const { user, currentOrg, loading } = useUser();
  const goBack = useBack();

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
        <BackButton onClick={goBack} />
        <div className={styles.profile}>
          <Avatar user={user} org={currentOrg} size="large" />
          <h1 className={styles.name}>{`${currentOrg.name}`}</h1>
          <p className={styles.location}>Oslo, NO</p>
          <p className={styles.description}>{currentOrg.description}</p>
        </div>
        <OrgMenu />
      </div>
    );
  }

  if (!loading && user) {
    return (
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.profile}>
          <Avatar user={user} size="large" />
          <h1
            className={styles.name}
          >{`${user.firstName} ${user.lastName}`}</h1>
          <p className={styles.location}>Oslo, NO</p>
          <p className={styles.description}>{user.description}</p>
        </div>
        <ProfileMenu />
      </div>
    );
  }

  return <></>;
};

export default Me;
