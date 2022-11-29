import { NextPage } from "next";

import Avatar from "../../components/Avatar";

import ProfileMenu from "../../components/ProfileMenu";
import useUser from "../../hooks/useUser";
import styles from "../../styles/me.module.scss";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import BackButton from "../../components/BackButton";
import useBack from "../../hooks/useBack";
import HeadComponent from "../../components/HeadComponent";
import { injectLink } from "../../utils/functions";

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
          <div className={styles.profile}>
            <Avatar user={user} size="large" />
            <h1
              className={styles.name}
            >{`${user.firstName} ${user.lastName}`}</h1>
            <p className={styles.description}>
              {injectLink(user.description ?? "")}
            </p>
          </div>
          <ProfileMenu />
        </div>
      </>
    );
  }

  return <></>;
};

export default Me;
