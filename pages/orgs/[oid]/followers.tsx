import useSWR from "swr";
import { useRouter } from "next/router";

import BackButton from "../../../components/BackButton";
import Layout from "../../../components/Layout";
import MemberCard from "../../../components/MemberCard";
import HeadComponent from "../../../components/HeadComponent";
import useBack from "../../../hooks/useBack";
import useRedirectWithReason from "../../../hooks/useRedirectWithReason";
import { followerListBlockedReason } from "../../../utils/organizationAccess";
import useOrganization from "../../../hooks/useOrganization";
import RequireUser from "../../../components/RequireUser";
import useSnack from "../../../hooks/useSnack";
import {
  Alignment,
  type ArrangerFollower,
  SnackTypes,
} from "../../../types/types";
import styles from "../../../styles/OrgFollowers.module.scss";

const FollowerList = () => {
  const goBack = useBack();
  const router = useRouter();
  const { addSnack } = useSnack();
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
    isAdminOrOwner && organization
      ? `/organizations/${organization.id}/followers`
      : null,
  );

  useRedirectWithReason({
    reason: followerListBlockedReason({
      loading: organizationLoading,
      signedIn: true,
      hasOrganization: Boolean(organization),
      isAdminOrOwner,
      fetchFailed: Boolean(organizationError),
    }),
    to: `/orgs/${oid}`,
  });

  if (organizationLoading || !organization || !followersData) {
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

const OrgFollowers = () => <RequireUser>{() => <FollowerList />}</RequireUser>;

export default OrgFollowers;
