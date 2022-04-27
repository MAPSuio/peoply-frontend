import { NextPage } from "next";
import useBack from "../../hooks/useBack";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
import ProfileMenu from "../../components/ProfileMenu";
import useUser from "../../hooks/useUser";
import styles from "../../styles/me.module.scss";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import OrgMenu from "../../components/OrgMenu";
import { useState } from "react";
import UserSelect from "../../components/UserSelect";
import { User } from "../../types/types";

const Me: NextPage = () => {
  const { user, currentOrg, loading } = useUser();
  const goBack = useBack();
  const [users, setUsers] = useState<User[]>([]);

  const redirectToLogin = useRedirectToLogin();

  const setUser = (user: User) => {
    setUsers([user, ...users]);
  };

  const removeUser = (user: User) => {
    setUsers(users.filter((u) => u.id !== user.id));
  };

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
        <UserSelect
          onUserSelect={setUser}
          selectedUsers={users}
          onUserRemove={removeUser}
        />
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
