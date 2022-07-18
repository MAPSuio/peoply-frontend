import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import BackButton from "../../../../components/BackButton";
import MemberCard from "../../../../components/MemberCard";
import Button from "../../../../components/Button";
import useBack from "../../../../hooks/useBack";
import useUser from "../../../../hooks/useUser";
import { fetchFromPeoplyApiJson } from "../../../../services/fetchers";
import styles from "../../../../styles/OrgMembers.module.scss";
import {
  Organization,
  OrganizationRole,
  SnackTypes,
  UserOrganizationRoles,
} from "../../../../types/types";
import useSnack from "../../../../hooks/useSnack";
import { GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import HeadComponent from "../../../../components/HeadComponent";

interface MembersProps {
  users: UserOrganizationRoles[];
  baseUrl: string;
}

export default function Members({ users, baseUrl }: MembersProps) {
  const goBack = useBack();
  const { user, loading } = useUser();
  const router = useRouter();
  const { oid } = router.query;
  const { data: organizationUsers, error: userError } = useSWR<
    UserOrganizationRoles[]
  >(
    () => (oid ? `/organizations/${oid}/members` : false),
    fetchFromPeoplyApiJson,
    {
      fallbackData: users,
    },
  );

  const { data: org, error: orgError } = useSWR<Organization>(
    () => (oid ? `/organizations/${oid}` : false),
    fetchFromPeoplyApiJson,
  );

  const { addSnack } = useSnack();

  const isAdmin =
    user &&
    organizationUsers &&
    organizationUsers.find(
      (orgUser) =>
        orgUser.user.id === user.id && orgUser.role === OrganizationRole.ADMIN,
    );

  if (loading) {
    return <></>;
  }

  if (userError || orgError) {
    addSnack("Kunne ikke hente oppdatert data", SnackTypes.ERROR);
  }

  const filterMembersByRole = (
    users: UserOrganizationRoles[],
    role: OrganizationRole,
  ) => users.filter((user) => user.role === role);

  if (organizationUsers && org) {
    return (
      <>
        <HeadComponent
          title={`${org.name} - medlemmer`}
          description={`Medlemmer i ${org.name}`}
          url={`${baseUrl}/organizations/${oid}/members`}
          imageUrl={org.image}
        />

        <div className={styles.container}>
          <BackButton onClick={goBack} />
          <div className={styles.header}>
            <h1>Medlemmer</h1>
            <p>Se og behandle medlemmer i {org.name}</p>
          </div>
          <div className={styles.memberList}>
            <h2>Eier</h2>
            <div className={styles.owner}>
              {filterMembersByRole(
                organizationUsers,
                OrganizationRole.OWNER,
              ).map(({ user }) => (
                <MemberCard key={user.id} user={user} />
              ))}
            </div>
            <h2>Administratorer</h2>
            <div className={styles.admins}>
              {filterMembersByRole(
                organizationUsers,
                OrganizationRole.ADMIN,
              ).map(({ user }) => (
                <MemberCard key={user.id} user={user} />
              ))}
            </div>
            <h2>Medlemmer</h2>
            <div className={styles.members}>
              {filterMembersByRole(
                organizationUsers,
                OrganizationRole.MEMBER,
              ).map(({ user }) => (
                <MemberCard key={user.id} user={user} />
              ))}
            </div>
          </div>
          {isAdmin && (
            <Link href={`/orgs/${oid}/invite`} passHref>
              <a className={styles.primaryButton}>
                <Button text="Legg til flere" />
              </a>
            </Link>
          )}
        </div>
      </>
    );
  }
  return <></>;
}

interface IParams extends ParsedUrlQuery {
  oid: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as IParams;
  const users = await fetchFromPeoplyApiJson(`/organizations/${oid}/members`);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!users) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      users,
      baseUrl,
    },
    revalidate: 60 * 60,
  };
};

export async function getStaticPaths() {
  const orgs: Organization[] = await fetchFromPeoplyApiJson(
    "/organizations?take=1000",
  );
  const paths = orgs.map((org: Organization) => ({
    params: { oid: `${org.id}` },
  }));

  return { paths, fallback: "blocking" };
}
