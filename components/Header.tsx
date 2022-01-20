import useUser from "../hooks/useUser";

import styles from "../styles/Header.module.scss";
import Link from "next/link";
import Avatar from "./Avatar";

export default function Header() {
  const { user } = useUser();

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
            </>
          ) : (
            <Link href="/login">Log in</Link>
          )}
        </div>
      </div>
    </div>
  );
}
