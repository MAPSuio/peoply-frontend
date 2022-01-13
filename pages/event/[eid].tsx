import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import useUser from "../../hooks/useUser";
import { useRouter } from "next/router";
import styles from "../../styles/Event.module.scss";

const Event: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const { eid } = router.query;

  return (
    <div className={styles.eventWrapper}>
      <Image
        src={"/assets/undraw_partying.png"}
        width="100%"
        height="70%"
        layout="responsive"
        objectFit="cover"
        objectPosition="center top"
        alt="Nå er det fest!"
      />
      <div className={styles.eventContainer}>
        <h1>The user was fetched correctly</h1>
        <div className={styles.eventDescContainer}>
          <h2>Informasjon</h2>
          <p className={styles.description}>Her kommer deskripsjonen.</p>
        </div>
      </div>
    </div>
  );
};

export default Event;
