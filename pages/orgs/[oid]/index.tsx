// Next.js.
import Link from "next/link";
import { GetStaticProps } from "next";
import useSWR from "swr";
import Image from "next/image";
import { useRouter } from "next/router";

// React.
import { useRef } from "react";

// Components.
import HeadComponent from "../../../components/HeadComponent";
import BackButton from "../../../components/BackButton";
import LargeEventCard from "../../../components/LargeEventCard";
import Layout from "../../../components/Layout";
import UserIconCard from "../../../components/svgs/UserIconCard";
import CalendarIconCard from "../../../components/svgs/CalendarIconCard";
import SmallCheckCircle from "../../../components/SmallCheckCircle";
import SettingsIcon from "../../../components/svgs/SettingsIcon";

// Hooks.
import useBack from "../../../hooks/useBack";
import useSnack from "../../../hooks/useSnack";
import useOrganization from "../../../hooks/useOrganization";

// Services.
import {
  getOrganization,
  getXOrganizations,
} from "../../../services/organizations";
import { Event, Organization, SnackTypes } from "../../../types/types";
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

// Assets.
import { ParsedUrlQuery } from "querystring";

// Styles.
import styles from "../../../styles/Organization.module.scss";
import Avatar from "../../../components/Avatar";

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

  if (orgLoading) {
    return <></>;
  }

  if (!organization && (!orgData || orgError || orgEventsError)) {
    addSnack("Kunne ikke hente organisasjonsdata", SnackTypes.ERROR);
    return <></>;
  }

  /* use either fresh or fallback data */
  const org = orgData ?? organization;

  return (
    <>
      <HeadComponent
        title={org.name}
        description={
          org.description
            ? org.description
            : `Organisasjonssiden til ${org.name}`
        }
        url={`${baseUrl}/orgs/${org?.id}`}
        imageUrl={org.image}
      />

      <Layout>
        <div className={styles.heading}>
          <BackButton onClick={goBack} className={styles.marginBottomMedium} />
          {isAdminOrOwner && (
            <Link href={`/orgs/${org.id}/settings`} passHref>
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
          <p className={styles.description}>{org.description}</p>
        </div>
        <div className={styles.dataContainer}>
          <Link href={`${baseUrl}/orgs/${org.id}/members`}>
            <a className={styles.iconContainer}>
              <UserIconCard className={styles.icon} />
              <p className={styles.data}>{orgMembers?.length}</p>
              <p className={styles.dataDescription}>Medlemmer</p>
            </a>
          </Link>
          <Link href={`${baseUrl}/orgs/${org.id}/events`}>
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
            <Link href={`${baseUrl}/orgs/${org.id}/events`}>
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
      oid: o.id,
    },
  }));

  return { paths, fallback: "blocking" };
}

export default Organization;
