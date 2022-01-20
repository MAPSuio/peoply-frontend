import useUser from "../hooks/useUser";

import styles from "../styles/Header.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import Avatar from "./Avatar";

export default function Header() {
  const { user, logout } = useUser();
  const router = useRouter();

  const logoutHandler = async () => {
    logout();
    router.push("/");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1>Peoply</h1>

        <div className={styles.avatarContainer}>
          {user ? (
            <>
              <Link href="/me" passHref>
                <a>
                  <Avatar user={user} />{" "}
                </a>
              </Link>
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
