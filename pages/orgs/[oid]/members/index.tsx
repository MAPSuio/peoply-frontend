import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

import BackButton from "../../../../components/BackButton";
import MemberCard from "../../../../components/MemberCard";
import Button from "../../../../components/Button";
import useBack from "../../../../hooks/useBack";
import styles from "../../../../styles/OrgMembers.module.scss";
import {
  OrganizationRole,
  SnackTypes,
  UserOrganizationRoles,
} from "../../../../types/types";
import useSnack from "../../../../hooks/useSnack";
import HeadComponent from "../../../../components/HeadComponent";
import { getOrganizationRolePrivilege } from "../../../../utils/functions";
import useOrganization from "../../../../hooks/useOrganization";
import EditIcon from "../../../../components/svgs/EditIcon";
import useRedirectToLogin from "../../../../hooks/useRedirectToLogin";
import useUser from "../../../../hooks/useUser";

export default function Members() {
  const goBack = useBack();
  const router = useRouter();
  const redirectToLogin = useRedirectToLogin();
  const { oid } = router.query;
  const { addSnack } = useSnack();
  const { user, loading: userLoading } = useUser();
  const {
    organization,
    organizationUsers,
    organizationUser,
    isAdminOrOwner,
    error: organizationError,
    loading: organizationLoading,
  } = useOrganization(oid as string);

  useEffect(() => {
    if (!userLoading && !user) {
      redirectToLogin();
    }
  }, [redirectToLogin, user, userLoading]);

  useEffect(() => {
    if (!organizationLoading && user && !organizationUsers) {
      addSnack("Du har ikke tilgang til medlemslisten", SnackTypes.ERROR);
      router.push(`/orgs/${oid}`);
    }
  }, [addSnack, oid, organizationLoading, organizationUsers, router, user]);

  if (organizationError) {
    addSnack("Kunne ikke hente oppdatert organisasjonsdata", SnackTypes.ERROR);
  }

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
        path={`/orgs/${oid}/members`}
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
