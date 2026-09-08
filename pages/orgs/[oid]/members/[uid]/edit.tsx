import { useRouter } from "next/router";

import HeadComponent from "../../../../../components/HeadComponent";
import MemberEditForm from "../../../../../components/organization/MemberEditForm";
import useBack from "../../../../../hooks/useBack";
import useOrganization from "../../../../../hooks/useOrganization";
import RequireUser from "../../../../../components/RequireUser";
import useRedirectWithReason from "../../../../../hooks/useRedirectWithReason";
import { memberEditBlockedReason } from "../../../../../utils/organizationAccess";
import type { User } from "../../../../../types/types";

function MemberEditor({ user }: { user: User }) {
  const router = useRouter();
  const { oid, uid } = router.query;
  const memberListUrl = `/orgs/${oid}/members`;
  const goBack = useBack(memberListUrl);
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
  const canEdit = isAdminOrOwner || user.id === member?.userId;

  useRedirectWithReason({
    reason: memberEditBlockedReason({
      loading: loadingOrganization,
      signedIn: true,
      fetchFailed: Boolean(organizationError),
      canEdit,
      isMemberOfOrganization: Boolean(member),
    }),
    to: memberListUrl,
  });

  if (!organization || !member) {
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

export default function EditOrganizationUser() {
  return <RequireUser>{(user) => <MemberEditor user={user} />}</RequireUser>;
}
