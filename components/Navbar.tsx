import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Navbar.module.scss";
import AddIcon from "../components/AddIcon";
import HomeIcon from "./svgs/HomeIcon";
import CalendarIconSummary from "./svgs/CalendarIconSummary";
import SearchIcon from "./svgs/SearchIcon";
import BriefcaseIcon from "./svgs/BriefcaseIcon";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrollPos, setScrollPos] = useState(-1);

  const router = useRouter();

  /* hooks onto window scroll event to determine if
     navbar should be hidden */
  useEffect(() => {
    if (scrollPos < 0) {
      setScrollPos(window.pageYOffset);
    } else {
      const onscroll = function () {
        const currentScrollPos = window.pageYOffset;
        if (scrollPos > currentScrollPos) {
          setHidden(false);
        } else {
          setHidden(true);
        }
        setScrollPos(currentScrollPos);
      };
      window.addEventListener("scroll", onscroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", onscroll);
      };
    }
  }, [scrollPos]);

  /* matches given string on path (after host url -> /path) */
  const isActive = (href: string) => router.pathname === href;

  return (
    <div className={`${styles.wrapper} ${hidden ? styles.hidden : ""}`}>
      <div className={styles.container}>
        <div className={`${styles.item} ${isActive("/") ? styles.active : ""}`}>
          <Link href="/">
            <HomeIcon
              className={`${styles.icon} ${isActive("/") ? styles.active : ""}`}
            />
            {isActive("/") ? <span className={styles.underline}></span> : ""}
          </Link>
        </div>
        <div
          className={`${styles.item} ${isActive("/find") ? styles.active : ""}`}
        >
          <Link href="/find">
            <SearchIcon
              className={`${styles.icon} ${
                isActive("/find") ? styles.active : ""
              }`}
            />
            {isActive("/find") ? (
              <span className={styles.underline}></span>
            ) : (
              ""
            )}
          </Link>
        </div>
        <div className={`${isActive("/events/create") ? styles.active : ""}`}>
          <Link href="/events/create">
            <AddIcon classNames={styles.button} />
          </Link>
        </div>
        <div
          className={`${styles.item} ${
            isActive("/me/orgs") ? styles.active : ""
          }`}
        >
          <Link href="/me/orgs">
            <BriefcaseIcon
              className={`${styles.icon} ${
                isActive("/me/orgs") ? styles.active : ""
              }`}
            />
            {isActive("/me/orgs") ? (
              <span className={styles.underline}></span>
            ) : (
              ""
            )}
          </Link>
        </div>
        <div
          className={`${styles.item} ${
            isActive("/me/events") ? styles.active : ""
          }`}
        >
          <Link href="/me/events">
            <CalendarIconSummary
              className={`${styles.icon} ${
                isActive("/me/events") ? styles.active : ""
              }`}
            />
            {isActive("/me/events") ? (
              <span className={styles.underline}></span>
            ) : (
              ""
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
