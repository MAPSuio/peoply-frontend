import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Navbar.module.scss";
import HomeIcon from "./icons/HomeIcon";

export default function Navbar() {
  const router = useRouter();

  /* matches given string on path (after host url -> /path) */
  const isActive = (href: string) => router.pathname === href;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.item}>
          <Link href="/" passHref>
            <a>
              <HomeIcon />
              {isActive("/") ? <span className={styles.underline}></span> : ""}
            </a>
          </Link>
        </div>
        <div className={styles.item}>
          <Link href="/login" passHref>
            <a>
              <HomeIcon />
              {isActive("/login") ? (
                <span className={styles.underline}></span>
              ) : (
                ""
              )}
            </a>
          </Link>
        </div>
        <div className={styles.item}>
          <Link href="/events" passHref>
            <a>
              <HomeIcon />
              {isActive("/something") ? (
                <span className={styles.underline}></span>
              ) : (
                ""
              )}
            </a>
          </Link>
        </div>
        <div className={styles.item}>
          <Link href="/events" passHref>
            <a>
              <HomeIcon />
              {isActive("/other") ? (
                <span className={styles.underline}></span>
              ) : (
                ""
              )}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
