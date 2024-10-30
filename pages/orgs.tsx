// Next.js.
import { GetStaticProps } from "next";
import useSWRInfinite from "swr/infinite";
import HeadComponent from "../components/HeadComponent";
import Link from "next/link";

// React.
import { useMemo, useState } from "react";

// Components.
import Layout from "../components/Layout";
import OrganizationCard from "../components/OrganizationCard";
import BackButton from "../components/BackButton";
import Button from "../components/Button";

// Services.
import { fetchFromPeoplyApiJson } from "../services/fetchers";

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

function getGetKey(queryUrl: string, pageSize: number) {
  return (pageIndex: number, previousPageData: Organization[]) => {
    if (previousPageData && !previousPageData.length) return null;
    return `${queryUrl}?take=${pageSize}&skip=${pageIndex * pageSize}`;
  };
}

const OrganizationList = ({ baseUrl }: OrganizationListProps) => {
  const router = useRouter();
  const goBack = useBack();
  const [isMoreOrgs, setIsMoreOrgs] = useState(true);
  const orgQueryUrl = useMemo(
    () =>
      router.query
        ? `/organizations?${queryToString(router.query)}&`
        : `/organizations?`,
    [router.query],
  );

  const pageSize = 5;
  const getKey = getGetKey(orgQueryUrl, pageSize);

  const {
    data: organizations,
    error: organizationsError,
    size: organizationsSize,
    setSize: setOrganizationsSize,
  } = useSWRInfinite<Organization[]>(getKey, fetchFromPeoplyApiJson, {
    onSuccess: (data) => {
      if (data[data.length - 1].length < pageSize) setIsMoreOrgs(false);
    },
  });

  //filters dups from load more
  const uniqueOrganizations = useMemo(() => {
    const allOrgs = organizations?.flatMap((org) => org) ?? [];
    const orgMap = new Map();
    allOrgs.forEach((org) => {
      if (!orgMap.has(org.id)) {
        orgMap.set(org.id, org);
      }
    });
    return Array.from(orgMap.values()).reverse();
  }, [organizations]);

  const nextPage = isMoreOrgs
    ? () => {
        setOrganizationsSize(organizationsSize + 1);
      }
    : undefined;

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
              <a>
                <OrganizationCard organizationID={org.id} />
              </a>
            </Link>
          ))}
        </div>
        {nextPage && <Button text="Last inn flere" onClick={nextPage} />}
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
