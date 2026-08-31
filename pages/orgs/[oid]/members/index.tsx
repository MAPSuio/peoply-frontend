import Link from "../../../../components/Link";
import { useEffect } from "react";
import { useRouter } from "next/router";

import BackButton from "../../../../components/BackButton";
import MemberCard from "../../../../components/MemberCard";
import Button from "../../../../components/Button";
import useBack from "../../../../hooks/useBack";
import styles from "../../../../styles/OrgMembers.module.scss";
import {
  OrganizationRole,
  type UserOrganizationRoles,
} from "../../../../types/types";
import HeadComponent from "../../../../components/HeadComponent";
import { getOrganizationRolePrivilege } from "../../../../utils/functions";
import useOrganization from "../../../../hooks/useOrganization";
import EditIcon from "../../../../components/svgs/EditIcon";
import useRedirectToLogin from "../../../../hooks/useRedirectToLogin";
import useRedirectWithReason from "../../../../hooks/useRedirectWithReason";
import useUser from "../../../../hooks/useUser";

export default function Members() {
  const router = useRouter();
  const redirectToLogin = useRedirectToLogin();
  const { oid } = router.query;
  const organizationPageUrl = `/orgs/${oid}`;
  const goBack = useBack(organizationPageUrl);
  const { user, loading: userLoading } = useUser();
  const {
    organization,
    organizationUsers,
    organizationUser,
    isAdminOrOwner,
    membersForbidden,
    loading: organizationLoading,
  } = useOrganization(oid as string);

  useEffect(() => {
    if (!userLoading && !user) {
      redirectToLogin();
    }
  }, [redirectToLogin, user, userLoading]);

  /* `oid` is empty until the router has parsed the URL, and the member list is
     unknown until it has been fetched - neither is a reason to leave. */
  useRedirectWithReason({
    when:
      Boolean(oid) &&
      !organizationLoading &&
      Boolean(user) &&
      !organizationUsers,
    reason: membersForbidden
      ? "Bare medlemmer kan se medlemslisten"
      : "Kunne ikke hente medlemslisten",
    to: organizationPageUrl,
  });

  const filterMembersByRole = (
    users: UserOrganizationRoles[],
    role: OrganizationRole,
  ) => users.filter((member) => member.role === role);

  const renderMemberCardsByRole = (
    role: OrganizationRole,
    users: UserOrganizationRoles[],
  ) =>
    filterMembersByRole(users, role).map((orgUser) => {
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

  if (
    userLoading ||
    organizationLoading ||
    !organization ||
    !organizationUsers
  ) {
    return <></>;
  }

  return (
    <>
      <HeadComponent
        title={`${organization.name} - medlemmer`}
        description={`Medlemmer i ${organization.name}`}
        path={`${organizationPageUrl}/members`}
        imageUrl={organization.image}
      />
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.header}>
          <h1>Medlemmer</h1>
          <p>Se og behandle medlemmer i {organization.name}</p>
        </div>
        <div className={styles.memberList}>
          <h2>Eier</h2>
          <div className={styles.memberCards}>
            {renderMemberCardsByRole(OrganizationRole.OWNER, organizationUsers)}
          </div>
          <h2>Administratorer</h2>
          <div className={styles.memberCards}>
            {renderMemberCardsByRole(OrganizationRole.ADMIN, organizationUsers)}
          </div>
          <h2>Medlemmer</h2>
          <div className={styles.memberCards}>
            {renderMemberCardsByRole(
              OrganizationRole.MEMBER,
              organizationUsers,
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
