import useUser from "../hooks/useUser";

import styles from "../styles/Header.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import BackButton from "./BackButton";
import Avatar from "./Avatar";

export default function Header() {
  const { user, logout } = useUser();
  const router = useRouter();

  const logoutHandler = () => {
    logout();
    router.reload();
  };

  if (router.pathname === "/login") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <BackButton />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1>Peoply</h1>
        <div className={styles.avatarContainer}>
          {user ? (
            <>
              <Avatar user={user} />{" "}
              <button onClick={logoutHandler}>Log out</button>{" "}
            </>
          ) : (
            <Link href="/login">Log in</Link>
          )}
        </div>
      </div>
    </div>
  );
}
