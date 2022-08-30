import { NextPage } from "next";

import Avatar from "../../components/Avatar";

import ProfileMenu from "../../components/ProfileMenu";
import useUser from "../../hooks/useUser";
import styles from "../../styles/me.module.scss";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";

const Me: NextPage = () => {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return <></>;
  }

  if (!loading && !user) {
    router.push("/");
  }

  if (!loading && user) {
    return (
      <div className={styles.container}>
        <div className={styles.profile}>
          <Avatar user={user} size="large" />
          <h1
            className={styles.name}
          >{`${user.firstName} ${user.lastName}`}</h1>
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
