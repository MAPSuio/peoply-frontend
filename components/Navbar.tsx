import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Navbar.module.scss";
import AddIcon from "../components/AddIcon";
import HomeIcon from "./svgs/HomeIcon";
import CalendarIconSummary from "./svgs/CalendarIconSummary";

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
      window.addEventListener("scroll", onscroll);

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
          <Link href="/" passHref>
            <a>
              <HomeIcon />
              {isActive("/") ? <span className={styles.underline}></span> : ""}
            </a>
          </Link>
        </div>
        <div className={`${isActive("/event/create") ? styles.active : ""}`}>
          <Link href="/event/create" passHref>
            <a>
              <AddIcon classNames={styles.button} />
            </a>
          </Link>
        </div>
        <div
          className={`${styles.item} ${
            isActive("/me/events") ? styles.active : ""
          }`}
        >
          <Link href="/me/events" passHref>
            <a>
              <CalendarIconSummary className={styles.icon} />
              {isActive("/me/events") ? (
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
