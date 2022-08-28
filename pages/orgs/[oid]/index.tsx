// Next.js.
import Link from "next/link";
import { GetStaticProps } from "next";
import useSWR from "swr";
import Image from "next/image";

// React.
import { useRef } from "react";

// Components.
import HeadComponent from "../../../components/HeadComponent";
import BackButton from "../../../components/BackButton";
import MyEventCard from "../../../components/MyEventCard";
import Layout from "../../../components/Layout";
import UserIconCard from "../../../components/svgs/UserIconCard";
import CalendarIconCard from "../../../components/svgs/CalendarIconCard";

// Hooks.
import useBack from "../../../hooks/useBack";

// Services.
import {
  getOrganization,
  getXOrganizations,
} from "../../../services/organizations";
import { Event, Organization, User } from "../../../types/types";
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

// Assets.
import { ParsedUrlQuery } from "querystring";
import CatImg from "../../../assets/images/cat.jpg";

// Styles.
import styles from "../../../styles/Organization.module.scss";

interface OrganizationProps {
  organization: Organization;
  baseUrl: string;
}

const Organization = ({ organization, baseUrl }: OrganizationProps) => {
  const goBack = useBack();
  const today = useRef(new Date().toISOString());

  const {
    data: orgData,
    error: orgError,
    mutate: updateOrganization,
  } = useSWR<Organization>(
    `/organizations/${organization.id}`,
    fetchFromPeoplyApiJson,
    {
      fallbackData: organization,
    },
  );

  const {
    data: orgMembers,
    error: orgMembersError,
    mutate: updateOrganizationMembers,
  } = useSWR<User[]>(
    `/organizations/${organization.id}/members`,
    fetchFromPeoplyApiJson,
    {
      fallbackData: [],
    },
  );

  const {
    data: orgEvents,
    error: orgEventsError,
    mutate: updateOrganizationEvents,
  } = useSWR<Event[]>(
    () =>
      orgData?.id
        ? `/events?afterDate=${today.current}&organizationId=${orgData?.id}`
        : false,
    fetchFromPeoplyApiJson,
    {
      fallbackData: [],
    },
  );

  if (!orgData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <HeadComponent
        title={`Peoply - ${orgData.name}`}
        description={
          orgData.description
            ? orgData.description
            : `Organisasjonssiden til ${orgData.name}`
        }
        url={`${baseUrl}/organization/${orgData?.id}`}
        imageUrl={organization.image}
      />

      <Layout>
        <BackButton onClick={goBack} className={styles.marginBottomMedium} />
        <div className={styles.headerContainer}>
          {orgData.image ? (
            <div className={styles.imageContainer}>
              <Image
                src={orgData.image}
                alt="Organisasjonen sitt bilde"
                objectFit="cover"
                layout="fill"
                objectPosition="center"
              />
            </div>
          ) : (
            <div className={styles.imageContainer}>
              <Image
                src={CatImg}
                alt="En søt katt"
                objectFit="cover"
                layout="fill"
                objectPosition="center"
              />
            </div>
          )}
          <h1 className={styles.title}>{orgData.name}</h1>
          <p className={styles.description}>{orgData.description}</p>
        </div>
        <div className={styles.dataContainer}>
          <Link href={`${baseUrl}/orgs/${orgData.id}/members`}>
            <a className={styles.iconContainer}>
              <UserIconCard className={styles.icon} />
              <p className={styles.data}>{orgMembers?.length}</p>
              <p className={styles.dataDescription}>Medlemmer</p>
            </a>
          </Link>
          <Link href={`${baseUrl}/orgs/${orgData.id}/events`}>
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
            <Link href={`${baseUrl}/orgs/${orgData.id}/events`}>
              <a className={styles.link}>Se alle</a>
            </Link>
          </div>
          <div className={styles.eventContainer}>
            {orgEvents?.map((event: Event) => (
              <MyEventCard key={event.id} event={event} />
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
