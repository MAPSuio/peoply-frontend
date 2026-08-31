import useSWR from "swr";
import { useEffect } from "react";
import { useRouter } from "next/router";

import BackButton from "../../../components/BackButton";
import Layout from "../../../components/Layout";
import MemberCard from "../../../components/MemberCard";
import HeadComponent from "../../../components/HeadComponent";
import useBack from "../../../hooks/useBack";
import useRedirectWithReason from "../../../hooks/useRedirectWithReason";
import { followerListBlockedReason } from "../../../utils/organizationAccess";
import useOrganization from "../../../hooks/useOrganization";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import {
  Alignment,
  type ArrangerFollower,
  SnackTypes,
} from "../../../types/types";
import styles from "../../../styles/OrgFollowers.module.scss";

const OrgFollowers = () => {
  const goBack = useBack();
  const router = useRouter();
  const redirectToLogin = useRedirectToLogin();
  const { addSnack } = useSnack();
  const { user, loading: userLoading } = useUser();
  const { oid } = router.query;
  const {
    organization,
    isAdminOrOwner,
    error: organizationError,
    loading: organizationLoading,
  } = useOrganization(oid as string);

  const { data: followersData, error: followersError } = useSWR<
    ArrangerFollower[]
  >(
    user && isAdminOrOwner && organization
      ? `/organizations/${organization.id}/followers`
      : null,
  );

  useEffect(() => {
    if (!userLoading && !user) {
      redirectToLogin();
    }
  }, [redirectToLogin, user, userLoading]);

  useRedirectWithReason({
    reason: followerListBlockedReason({
      loading: organizationLoading,
      signedIn: Boolean(user),
      hasOrganization: Boolean(organization),
      isAdminOrOwner,
      fetchFailed: Boolean(organizationError),
    }),
    to: `/orgs/${oid}`,
  });

  if (userLoading || organizationLoading || !organization || !followersData) {
    return <></>;
  }

  if (followersError) {
    addSnack("Kunne ikke hente følgerne", SnackTypes.ERROR);
    return <></>;
  }

  return (
    <>
      <HeadComponent
        title={`${organization.name} | Følgere`}
        description={`Følgere for ${organization.name}`}
      />
      <Layout align={Alignment.CENTER}>
        <BackButton onClick={goBack} />
        <div className={styles.headingContainer}>
          <h1>Følgere</h1>
          <p>Her kan du se alle følgerne til {organization.name}</p>
        </div>
        <ul className={styles.followersList}>
          {followersData.map((follower) => (
            <li className={styles.listItem} key={follower.userId}>
              <MemberCard
                user={follower.user}
                description={follower.user.description}
              />
            </li>
          ))}
        </ul>
      </Layout>
    </>
  );
};

export default OrgFollowers;
