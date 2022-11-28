// Next.js.
import { GetStaticProps } from "next";

// Components.
import BackButton from "../../../components/BackButton";
import Layout from "../../../components/Layout";
import MemberCard from "../../../components/MemberCard";

// Hooks.
import useBack from "../../../hooks/useBack";

// Services.
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";
import {
  getOrganization,
  getXOrganizations,
} from "../../../services/organizations";

// Types.
import {
  Alignment,
  ArrangerFollower,
  Organization,
} from "../../../types/types";

// Assets.
import { ParsedUrlQuery } from "querystring";

// Styles.
import styles from "../../../styles/OrgFollowers.module.scss";
import ExitIcon from "../../../components/svgs/ExitIcon";
import ChevronRightIcon from "../../../components/svgs/ChevronRightIcon";

interface OrgFollowersProps {
  org: Organization;
  followers: ArrangerFollower[];
  baseUrl: string;
}

const OrgFollowers = ({ org, followers, baseUrl }: OrgFollowersProps) => {
  const goBack = useBack();

  return (
    <Layout align={Alignment.CENTER}>
      <BackButton onClick={goBack} />
      <div className={styles.headingContainer}>
        <h1>Følgere</h1>
        <p>Her kan du se alle følgerne til {org.name}</p>
      </div>
      <ul className={styles.followersList}>
        {followers.map((follower) => (
          <li key={follower.arrangerId}>
            <MemberCard
              user={follower.user}
              description={follower.user.description}
            />
          </li>
        ))}
      </ul>
    </Layout>
  );
};

interface IParams extends ParsedUrlQuery {
  oid: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as IParams;

  const org = await getOrganization(oid);
  const followers = await fetchFromPeoplyApiJson(
    `/organizations/${oid}/followers`,
  );
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!org) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      baseUrl,
      org,
      followers,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};

export async function getStaticPaths() {
  const orgs = await getXOrganizations(1000);
  const paths = orgs.map((org) => ({
    params: { oid: org.urlId ?? org.id },
  }));

  return { paths, fallback: "blocking" };
}

export default OrgFollowers;
