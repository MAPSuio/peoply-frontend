import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Navbar.module.scss";
import HomeIcon from "./icons/HomeIcon";

export default function Navbar() {
  const router = useRouter();

  console.log(router.pathname);
  const isActive = (href: string) => router.pathname === href;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={`${styles.item}`}>
          <Link href="/" passHref>
            <a>
              <HomeIcon />
              {isActive("/") ? <span className={styles.active}></span> : ""}
            </a>
          </Link>
        </div>
        <div className={styles.item}>
          <Link href="/login" passHref>
            <a>
              <HomeIcon />
              {isActive("/login") ? (
                <span className={styles.active}></span>
              ) : (
                ""
              )}
            </a>
          </Link>
        </div>
        <div
          className={`${styles.item} ${
            isActive("/events") ? styles.active : ""
          }`}
        >
          <Link href="/events" passHref>
            <HomeIcon />
          </Link>
        </div>
        <div
          className={`${styles.item} ${
            isActive("/events") ? styles.active : ""
          }`}
        >
          <Link href="/events" passHref>
            <HomeIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
