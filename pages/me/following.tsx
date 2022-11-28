// Next.js.
import useSWR from "swr";
import Image from "next/image";

// Hooks.
import useUser from "../../hooks/useUser";
import useBack from "../../hooks/useBack";

// Services.
import { fetchFromPeoplyApiJson } from "../../services/fetchers";

// Types.
import { Alignment, ArrangerFollower } from "../../types/types";

// Components.
import HeadComponent from "../../components/HeadComponent";
import Layout from "../../components/Layout";
import BackButton from "../../components/BackButton";
import ArrangerListItem from "../../components/ArrangerListItem";

// Assets.
import AloneImage from "../../assets/images/undraw_alone.png";

// Styles.
import styles from "../../styles/Following.module.scss";

interface FollowingProps {
  baseUrl: string;
}

const Following = ({ baseUrl }: FollowingProps) => {
  const { user, loading } = useUser();
  const goBack = useBack();

  const { data: followedArrangers, error: followedArrangersError } = useSWR<
    ArrangerFollower[]
  >(user ? `/users/${user.id}/following` : null, fetchFromPeoplyApiJson);

  const renderFollowingList = () => {
    if (followedArrangers && followedArrangers.length > 0) {
      return (
        <ul className={styles.followingList}>
          {followedArrangers &&
            followedArrangers.length > 0 &&
            followedArrangers.map((a) => (
              <ArrangerListItem key={a.arrangerId} arrangerFollower={a} />
            ))}
        </ul>
      );
    } else {
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
    }
  };

  return (
    <>
      <HeadComponent
        title="Følger"
        description="Her kan du se hvem du følger"
        url={`${baseUrl}/me/following`}
      />

      <Layout align={Alignment.CENTER}>
        <BackButton onClick={goBack} />
        <div className={styles.headingContainer}>
          <h1>Følger</h1>
          <p>Her kan du se alle arrangørene du følger</p>
        </div>
        {renderFollowingList()}
      </Layout>
    </>
  );
};

export const getStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  return {
    props: {
      baseUrl,
    },
  };
};

export default Following;
