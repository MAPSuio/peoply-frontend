import { NextPage } from "next";
import { useRouter } from "next/router";
import useBack from "../hooks/useBack";
import Avatar from "../components/Avatar";
import BackButton from "../components/BackButton";
import ProfileMenu from "../components/ProfileMenu";
import useUser from "../hooks/useUser";
import styles from "../styles/me.module.scss";

const Me: NextPage = () => {
  const { user, loading } = useUser();
  const goBack = useBack();

  const router = useRouter();

  if (loading) {
    return <></>;
  }

  if (!loading && !user) {
    router.push("/login");
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
          <p className={styles.description}>Example description here</p>
        </div>
        <ProfileMenu />
      </div>
    );
  }

  return <></>;
};

export default Me;
