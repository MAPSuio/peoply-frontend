import { useRouter } from "next/router";
import useSWR from "swr";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
import { User } from "../../types/types";
import useBack from "../../hooks/useBack";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import styles from "../../styles/User.module.scss";

const User = () => {
  const goBack = useBack();
  const router = useRouter();
  const { uid } = router.query;

  const { data: userData, error: userError } = useSWR<User>(
    () => (uid ? `/users/${uid}` : false),
    fetchFromPeoplyApiJson,
  );

  if (userError) {
    router.push("/404");
    return <></>;
  }

  if (!userData) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <div className={styles.profile}>
        <Avatar user={userData} size="large" />
        <h1
          className={styles.name}
        >{`${userData.firstName} ${userData.lastName}`}</h1>
        <p className={styles.location}>Oslo, NO</p>
        <p className={styles.description}>{userData.description}</p>
      </div>
    </div>
  );
};

export default User;
