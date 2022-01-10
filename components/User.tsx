import type { NextPage } from "next";
import { useRouter } from "next/router";
import useUser from "../hooks/useUser";
import styles from "../styles/User.module.scss";

const User: NextPage = () => {
  const { user, mutate, logout, isError } = useUser();
  const router = useRouter();

  const logoutHandler = () => {
    logout();
    mutate();
    router.reload();
  };

  if (isError) return <>Logged out?</>;
  if (!user)
    return (
      <div>
        <a href="http://localhost:3000/auth/login"> Log in</a>
      </div>
    );

  return (
    <div>
      <h3 className={styles.title}>
        {" "}
        Welcome {`${user.first_name} ${user.last_name}`}
      </h3>
      <button onClick={logoutHandler}>Log out</button>
    </div>
  );
};

export default User;
