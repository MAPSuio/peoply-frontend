import { useRouter } from "next/router";
import useSWR from "swr";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
/* Type-only: shadowed by the `User` component below - see the note in
   pages/events/[eid]/index.tsx. */
import type { User } from "../../types/types";
import useBack from "../../hooks/useBack";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import styles from "../../styles/User.module.scss";
import { GetStaticPaths, GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import HeadComponent from "../../components/HeadComponent";

interface UserProps {
  user: User;
  baseUrl: string;
}

const User = ({ user, baseUrl }: UserProps) => {
  const goBack = useBack();
  const router = useRouter();
  const { data: userData, error: userError } = useSWR<User>(
    `/users/${user.id}`,
    fetchFromPeoplyApiJson,
    {
      fallbackData: user,
    },
  );

  if (userError) {
    router.push("/404");
    return <></>;
  }

  if (!userData) {
    return <></>;
  }

  return (
    <>
      <HeadComponent
        title={`${userData.firstName} ${userData.lastName}`}
        description={`${userData.description}`}
        url={`${baseUrl}/users/${user.id}`}
        imageUrl={userData.image}
        noIndex={true}
      />
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.profile}>
          <Avatar user={userData} size="large" />
          <h1
            className={styles.name}
          >{`${userData.firstName} ${userData.lastName}`}</h1>
          <p className={styles.description}>{userData.description}</p>
        </div>
      </div>
    </>
  );
};

interface IParams extends ParsedUrlQuery {
  uid: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { uid } = context.params as IParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const user = await fetchFromPeoplyApiJson(`/users/${uid}`);

    if (!user) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        baseUrl,
        user,
      },
      revalidate: 60 * 30, // 30 minutes
    };
  } catch (error) {
    console.error(`Failed to fetch user ${uid}:`, error);
    return {
      notFound: true,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export default User;
