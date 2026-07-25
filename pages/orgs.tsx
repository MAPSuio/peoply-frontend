// Next.js.
import { GetStaticProps } from "next";
import useSWR from "swr";
import HeadComponent from "../components/HeadComponent";
import Link from "next/link";

// React.
import { useMemo } from "react";

// Components.
import Layout from "../components/Layout";
import OrganizationCard from "../components/OrganizationCard";
import BackButton from "../components/BackButton";

// Services.
import { fetchAllFromPeoplyApiJson } from "../services/fetchers";

// Types.
import { Alignment, Organization } from "../types/types";

// Hooks.
import useBack from "../hooks/useBack";

// Styles.
import styles from "../styles/OrganizationList.module.scss";
import { useRouter } from "next/router";
import { queryToString } from "../utils/functions";

interface OrganizationListProps {
  baseUrl: string;
}

const OrganizationList = ({ baseUrl }: OrganizationListProps) => {
  const router = useRouter();
  const goBack = useBack();
  const orgQueryUrl = useMemo(() => {
    const query = queryToString(router.query);
    return query ? `/organizations?${query}` : "/organizations";
  }, [router.query]);

  const { data: organizations, error: organizationsError } = useSWR<
    Organization[]
  >(orgQueryUrl, fetchAllFromPeoplyApiJson);

  const uniqueOrganizations = useMemo(() => {
    const allOrgs = organizations ?? [];
    const orgMap = new Map();
    allOrgs.forEach((org) => {
      if (!orgMap.has(org.id)) {
        orgMap.set(org.id, org);
      }
    });
    return Array.from(orgMap.values());
  }, [organizations]);

  return (
    <>
      <HeadComponent
        title="Foreninger"
        description="Se alle foreningene på IFI"
        url={`${baseUrl}/orgs`}
      />
      <Layout align={Alignment.CENTER}>
        <BackButton onClick={goBack} />
        <div className={styles.headerContainer}>
          <h1>Foreninger på IFI</h1>
          <p>Her kan du se alle foreningene på IFI</p>
        </div>
        {organizationsError && <div className={styles.errorContainer}></div>}
        <div className={styles.orgList}>
          {uniqueOrganizations.map((org) => (
            <Link href={`/orgs/${org.urlId ?? org.id}`} key={org.id}>
              <OrganizationCard organizationID={org.id} />
            </Link>
          ))}
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  return {
    props: {
      baseUrl,
    },
  };
};

export default OrganizationList;
