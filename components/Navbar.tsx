import Link from "./Link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Navbar.module.scss";
import AddIcon from "../components/AddIcon";
import HomeIcon from "./svgs/HomeIcon";
import CalendarCheckIcon from "./svgs/CalendarCheckIcon";
import CalendarIconSummary from "./svgs/CalendarIconSummary";
import SearchIcon from "./svgs/SearchIcon";

/* How far you have to scroll before the bar changes its mind. A finger never
   moves in one direction only, and every direction change restarts a transform
   transition on a fixed, backdrop-blurred element. */
const DIRECTION_THRESHOLD_PX = 8;

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  /* A ref, not state. As state it was also the dependency of the effect below,
     so every scroll event re-rendered the bar and tore the listener down and
     built it back up: measured at ~7 add/remove cycles per second of scrolling
     on a phone-sized viewport. Nothing renders the position, so it does not
     belong in state. */
  const lastScrollY = useRef(0);

  const router = useRouter();

  /* Hide the bar on the way down, bring it back on the way up. */
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) < DIRECTION_THRESHOLD_PX) return;

      lastScrollY.current = currentScrollY;
      /* Never hidden at the very top: iOS rubber-banding past 0 comes back as
         a downward delta, which used to tuck the bar away on a page that had
         not been scrolled at all. Setting the same value again is a no-op in
         React, so a steady scroll re-renders nothing. */
      setHidden(delta > 0 && currentScrollY > DIRECTION_THRESHOLD_PX);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

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
            isActive("/me/events") ? styles.active : ""
          }`}
        >
          <Link href="/me/events">
            <CalendarCheckIcon
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
        <div
          className={`${styles.item} ${
            isActive("/kalender") ? styles.active : ""
          }`}
        >
          <Link href="/kalender">
            <CalendarIconSummary
              className={`${styles.icon} ${
                isActive("/kalender") ? styles.active : ""
              }`}
            />
            {isActive("/kalender") ? (
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
