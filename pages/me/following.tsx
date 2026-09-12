// Next.js.
import useSWR from "swr";
import Image from "next/legacy/image";

// Hooks.
import useBack from "../../hooks/useBack";
import RequireUser from "../../components/RequireUser";

// Services.

// Types.
import { Alignment, type ArrangerFollower, type User } from "../../types/types";

// Components.
import HeadComponent from "../../components/HeadComponent";
import Layout from "../../components/Layout";
import BackButton from "../../components/BackButton";
import ArrangerListItem from "../../components/ArrangerListItem";
import QueryState from "../../components/QueryState";

// Assets.
import AloneImage from "../../assets/images/undraw_alone.png";

// Styles.
import styles from "../../styles/Following.module.scss";

const FollowedArrangers = ({ user }: { user: User }) => {
  const goBack = useBack();

  /* An answer we do not have yet is not an answer of "nobody". QueryState
     shows LoadingWheel while a request is in flight, so a slow request never
     flashes the empty state - and a failed request stops being silent, since
     SwrProvider swallows 401/403/404. */
  const followingQuery = useSWR<ArrangerFollower[]>(
    `/users/${user.id}/following`,
  );

  const renderFollowingList = (followedArrangers: ArrangerFollower[]) => {
    if (followedArrangers.length > 0) {
      return (
        <ul className={styles.followingList}>
          {followedArrangers.map((a) => (
            <ArrangerListItem key={a.arrangerId} arrangerFollower={a} />
          ))}
        </ul>
      );
    }

    return (
      <>
        <div className={styles.imageContainer}>
          <Image
            src={AloneImage}
            layout="fill"
            alt="Arrangøren av arrangementet"
            objectFit="cover"
            placeholder="blur"
          />
        </div>
        <h2 className={styles.errorMessage}>
          Det virker som du ikke følger noen arrangører enda...
        </h2>
      </>
    );
  };

  return (
    <>
      <HeadComponent
        title="Følger"
        description="Her kan du se hvem du følger"
        path="/me/following"
      />

      <Layout align={Alignment.CENTER}>
        <BackButton onClick={goBack} />
        <div className={styles.headingContainer}>
          <h1>Følger</h1>
          <p>Her kan du se alle arrangørene du følger</p>
        </div>
        <QueryState
          query={followingQuery}
          errorMessage="Vi fikk ikke hentet arrangørene du følger. Prøv igjen om litt."
        >
          {renderFollowingList}
        </QueryState>
      </Layout>
    </>
  );
};

const Following = () => (
  <RequireUser>{(user) => <FollowedArrangers user={user} />}</RequireUser>
);

export default Following;
