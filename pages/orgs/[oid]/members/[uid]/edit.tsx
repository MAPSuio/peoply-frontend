import { useRouter } from "next/router";

import HeadComponent from "../../../../../components/HeadComponent";
import MemberEditForm from "../../../../../components/organization/MemberEditForm";
import useBack from "../../../../../hooks/useBack";
import useOrganization from "../../../../../hooks/useOrganization";
import useRedirectWithReason from "../../../../../hooks/useRedirectWithReason";
import { memberEditBlockedReason } from "../../../../../utils/organizationAccess";
import useUser from "../../../../../hooks/useUser";

export default function EditOrganizationUser() {
  const router = useRouter();
  const { oid, uid } = router.query;
  const memberListUrl = `/orgs/${oid}/members`;
  const goBack = useBack(memberListUrl);
  const { user, loading } = useUser();
  const {
    organization,
    organizationUsers,
    organizationUser,
    isAdminOrOwner,
    isOwner,
    isAdmin,
    loading: loadingOrganization,
    error: organizationError,
  } = useOrganization(oid as string);

  const member = organizationUsers?.find((entry) => entry.userId === uid);
  const canEdit = isAdminOrOwner || user?.id === member?.userId;

  useRedirectWithReason({
    reason: memberEditBlockedReason({
      loading: loading || loadingOrganization,
      fetchFailed: Boolean(organizationError),
      canEdit,
      isMemberOfOrganization: Boolean(member),
    }),
    to: memberListUrl,
  });

  if (!user || !organization || !member) {
    return null;
  }

  return (
    <>
      <HeadComponent
        title={`${organization.name} - rediger medlem`}
        description={`Rediger et medlem i ${organization.name}`}
      />
      <MemberEditForm
        organization={organization}
        member={member}
        editorId={user.id}
        viewer={{
          isOwner,
          isAdmin,
          isAdminOrOwner,
          membership: organizationUser,
        }}
        onBack={goBack}
      />
    </>
  );
}
