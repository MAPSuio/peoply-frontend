import Link from "next/link";
import { useRouter } from "next/router";
import BackButton from "../../../../components/BackButton";
import MemberCard from "../../../../components/MemberCard";
import Button from "../../../../components/Button";
import useBack from "../../../../hooks/useBack";
import { fetchFromPeoplyApiJson } from "../../../../services/fetchers";
import styles from "../../../../styles/OrgMembers.module.scss";
import {
  OrganizationRole,
  SnackTypes,
  UserOrganizationRoles,
} from "../../../../types/types";
import useSnack from "../../../../hooks/useSnack";
import { GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import HeadComponent from "../../../../components/HeadComponent";
import { getOrganizationRolePrivilege } from "../../../../utils/functions";
import useOrganization from "../../../../hooks/useOrganization";
import EditIcon from "../../../../components/svgs/EditIcon";
import { getOrganization } from "../../../../services/organizations";

interface MembersProps {
  fallbackUsers: UserOrganizationRoles[];
  baseUrl: string;
}

export default function Members({ fallbackUsers, baseUrl }: MembersProps) {
  const goBack = useBack();
  const router = useRouter();
  const { oid } = router.query;
  const {
    organization,
    organizationUsers,
    organizationUser,
    isAdminOrOwner,
    error: organizationError,
  } = useOrganization(oid as string);

  const { addSnack } = useSnack();

  if (organizationError) {
    addSnack("Kunne ikke hente oppdatert organisasjonsdata", SnackTypes.ERROR);
  }

  const filterMembersByRole = (
    users: UserOrganizationRoles[],
    role: OrganizationRole,
  ) => users.filter((user) => user.role === role);

  const renderMemberCardsByRole = (
    role: OrganizationRole,
    organizationUsers: UserOrganizationRoles[],
  ) =>
    filterMembersByRole(organizationUsers, role).map((orgUser) => {
      const isEditingSelf = organizationUser?.user.id === orgUser.user.id;
      const hasHigherPrivilege =
        organizationUser &&
        getOrganizationRolePrivilege(organizationUser.role) >
          getOrganizationRolePrivilege(orgUser.role);
      const canEdit = isEditingSelf || hasHigherPrivilege;
      return canEdit ? (
        <MemberCard
          icon={<EditIcon />}
          iconOnClick={() =>
            router.push(`/orgs/${oid}/members/${orgUser.user.id}/edit`)
          }
          user={orgUser.user}
          description={orgUser.roleDescription}
          key={orgUser.user.id}
        />
      ) : (
        <MemberCard
          user={orgUser.user}
          description={orgUser.roleDescription}
          key={orgUser.user.id}
        />
      );
    });

  return (
    <>
      <HeadComponent
        title={`${organization?.name} - medlemmer`}
        description={`Medlemmer i ${organization?.name}`}
        url={`${baseUrl}/organizations/${oid}/members`}
        imageUrl={organization?.image}
      />
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.header}>
          <h1>Medlemmer</h1>
          <p>Se og behandle medlemmer i {organization?.name}</p>
        </div>
        <div className={styles.memberList}>
          <h2>Eier</h2>
          <div className={styles.memberCards}>
            {renderMemberCardsByRole(
              OrganizationRole.OWNER,
              organizationUsers ?? fallbackUsers,
            )}
          </div>
          <h2>Administratorer</h2>
          <div className={styles.memberCards}>
            {renderMemberCardsByRole(
              OrganizationRole.ADMIN,
              organizationUsers ?? fallbackUsers,
            )}
          </div>
          <h2>Medlemmer</h2>
          <div className={styles.memberCards}>
            {renderMemberCardsByRole(
              OrganizationRole.MEMBER,
              organizationUsers ?? fallbackUsers,
            )}
          </div>
        </div>
        {isAdminOrOwner && (
          <Link href={`/orgs/${oid}/invite`} className={styles.primaryButton}>
            <Button text="Legg til flere" />
          </Link>
        )}
      </div>
    </>
  );
}

interface IParams extends ParsedUrlQuery {
  oid: string;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as IParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const organization = await getOrganization(oid);
    const users = await fetchFromPeoplyApiJson(
      `/organizations/${organization.id}/members`,
    );

    if (!users) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        fallbackUsers: users,
        baseUrl,
      },
      revalidate: 60 * 60,
    };
  } catch (error) {
    console.error(`Failed to fetch org members for ${oid}:`, error);
    return {
      notFound: true,
    };
  }
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}
