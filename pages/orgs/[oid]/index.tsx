// Next.js.
import Link from "next/link";
import { GetStaticProps } from "next";
import useSWR from "swr";
import { useRouter } from "next/router";

// React.
import { useRef } from "react";

// Components.
import HeadComponent from "../../../components/HeadComponent";
import BackButton from "../../../components/BackButton";
import LargeEventCard from "../../../components/LargeEventCard";
import Layout from "../../../components/Layout";
import CalendarIconCard from "../../../components/svgs/CalendarIconCard";
import SmallCheckCircle from "../../../components/SmallCheckCircle";
import SettingsIcon from "../../../components/svgs/SettingsIcon";
import UsersIconCard from "../../../components/svgs/UsersIconCard";
import FollowIcon from "../../../components/svgs/FollowIcon";
import Avatar from "../../../components/Avatar";
import Button from "../../../components/Button";

// Hooks.
import useBack from "../../../hooks/useBack";
import useSnack from "../../../hooks/useSnack";
import useOrganization from "../../../hooks/useOrganization";
import useUser from "../../../hooks/useUser";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";

// Services.
import {
  getOrganization,
  getXOrganizations,
} from "../../../services/organizations";
import {
  ArrangerFollower,
  ButtonSize,
  ButtonType,
  Event,
  Organization,
  SnackTypes,
} from "../../../types/types";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../../services/fetchers";

// Assets.
import { ParsedUrlQuery } from "querystring";

// Styles.
import styles from "../../../styles/Organization.module.scss";
import { injectLink } from "../../../utils/functions";

interface OrganizationProps {
  organization: Organization;
  baseUrl: string;
}

const Organization = ({ organization, baseUrl }: OrganizationProps) => {
  const goBack = useBack();
  const { addSnack } = useSnack();
  const router = useRouter();
  const { oid } = router.query;
  const today = useRef(new Date().toISOString());
  const { user } = useUser();
  const redirectToLogin = useRedirectToLogin();

  const {
    organization: orgData,
    organizationUsers: orgMembers,
    isAdminOrOwner,
    loading: orgLoading,
    error: orgError,
  } = useOrganization(oid as string);

  const { data: orgEvents, error: orgEventsError } = useSWR<Event[]>(
    () =>
      orgData?.id
        ? `/events?afterDate=${today.current}&organizationId=${orgData?.id}`
        : false,
    fetchFromPeoplyApiJson,
    {
      fallbackData: [],
    },
  );

  const {
    data: followedArrangers,
    error: followedArrangersError,
    mutate: mutateFollowedArrangers,
  } = useSWR<ArrangerFollower[]>(
    user ? `/users/${user.id}/following` : null,
    fetchFromPeoplyApiJson,
  );

  const {
    data: followers,
    error: followersError,
    mutate: mutateFollowers,
  } = useSWR<ArrangerFollower[]>(
    orgData ? `/organizations/${orgData.id}/followers` : null,
    fetchFromPeoplyApiJson,
  );

  if (orgLoading) {
    return <></>;
  }

  if (!organization && (!orgData || orgError || orgEventsError)) {
    addSnack("Kunne ikke hente organisasjonsdata", SnackTypes.ERROR);
    return <></>;
  }

  /* use either fresh or fallback data */
  const org = orgData ?? organization;

  const followArranger = async () => {
    try {
      await fetchFromPeoplyApi(
        `/users/${user?.id}/following/${org.arrangerId}`,
        {
          method: "POST",
        },
      );
      mutateFollowedArrangers();
      mutateFollowers();
    } catch (e) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
  };

  const unfollowArranger = async () => {
    try {
      await fetchFromPeoplyApi(
        `/users/${user?.id}/following/${org.arrangerId}`,
        {
          method: "DELETE",
        },
      );
      mutateFollowedArrangers();
      mutateFollowers();
    } catch (e) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
  };

  const following = (() => {
    const arrangers = followedArrangers?.map((arranger) => arranger.arrangerId);
    return arrangers?.includes(org.arrangerId);
  })();

  const followButtonFunction = () => {
    if (user) {
      following ? unfollowArranger() : followArranger();
    } else {
      redirectToLogin();
    }
  };

  const followButtonText = (() => {
    return following ? "Følger" : "Følg";
  })();

  const followButtonType = (() => {
    return following ? ButtonType.CONFIRMED : ButtonType.PRIMARY;
  })();

  return (
    <>
      <HeadComponent
        title={org.name}
        description={
          org.description
            ? org.description
            : `Organisasjonssiden til ${org.name}`
        }
        url={`${baseUrl}/orgs/${org.urlId ?? org.id}`}
        imageUrl={org.image}
      />

      <Layout>
        <div className={styles.heading}>
          <BackButton onClick={goBack} className={styles.marginBottomMedium} />
          {isAdminOrOwner && (
            <Link href={`/orgs/${org.urlId ?? org.id}/settings`} passHref>
              <a aria-label="innstillinger">
                <SettingsIcon className={styles.settingsIcon} />
              </a>
            </Link>
          )}
        </div>
        <div className={styles.headerContainer}>
          <div className={styles.avatarContainer}>
            <Avatar org={org} size="large" />
          </div>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>{org.name}</h1>
            {org.orgNr && <SmallCheckCircle purple placeRight small />}
          </div>
          <div className={styles.description}>
            {org.description?.split("\n").map((str) => (
              <p key={str} className={styles.descText}>
                {injectLink(str)}
                <br></br>
              </p>
            ))}
          </div>
          <Button
            text={followButtonText}
            size={ButtonSize.TINYWITHTEXT}
            type={followButtonType}
            noShadow
            onClick={followButtonFunction}
            loading={!followedArrangers}
          />
        </div>
        <div className={styles.dataContainer}>
          <Link href={`${baseUrl}/orgs/${org.urlId ?? org.id}/members`}>
            <a className={styles.iconContainer}>
              <UsersIconCard className={`${styles.icon} ${styles.usersIcon}`} />
              <p className={styles.data}>{orgMembers?.length}</p>
              <p className={styles.dataDescription}>Medlemmer</p>
            </a>
          </Link>
          <Link href={`${baseUrl}/orgs/${org.urlId ?? org.id}/followers`}>
            <a className={styles.iconContainer}>
              <FollowIcon className={`${styles.icon} ${styles.followIcon}`} />
              <p className={styles.data}>{followers?.length}</p>
              <p className={styles.dataDescription}>Følgere</p>
            </a>
          </Link>
          <Link href={`${baseUrl}/orgs/${org.urlId ?? org.id}/events`}>
            <a className={styles.iconContainer}>
              <CalendarIconCard className={styles.icon} />
              <p className={styles.data}>{orgEvents?.length}</p>
              <p className={styles.dataDescription}>Arrangementer</p>
            </a>
          </Link>
        </div>
        <div className={styles.eventWrapper}>
          <div className={styles.eventHeaderContainer}>
            <h2 className={styles.eventHeader}>Kommende arrangementer</h2>
            <Link href={`${baseUrl}/orgs/${org.urlId ?? org.id}/events`}>
              <a className={styles.link}>Se alle</a>
            </Link>
          </div>
          <div className={styles.eventContainer}>
            {orgEvents?.map((event: Event) => (
              <LargeEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

interface IParams extends ParsedUrlQuery {
  oid: string;
}

// Get the data for the organization in question.
export const getStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as IParams;

  try {
    const organization = await getOrganization(oid);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!organization) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        baseUrl,
        organization,
      },
      revalidate: 60 * 30, // 30 minutes
    };
  } catch (error) {
    return {
      props: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        organization: null,
      },
      revalidate: 60 * 30, // 30 minutes
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
};

export async function getStaticPaths() {
  const organizations = await getXOrganizations(10000);
  const paths = organizations.map((o: Organization) => ({
    params: {
      oid: o.urlId ?? o.id,
    },
  }));

  return { paths, fallback: "blocking" };
}

export default Organization;
