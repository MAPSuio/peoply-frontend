import type { NextPage } from "next";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useEffect } from "react";

import BackButton from "../../../components/BackButton";
import Avatar from "../../../components/Avatar";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import QueryState from "../../../components/QueryState";
import useBack from "../../../hooks/useBack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import { MAPS_ORG_ID } from "../../../constants/organizations";
import {
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApi,
} from "../../../services/fetchers";
import {
  type Organization,
  OrganizationRole,
  SnackTypes,
} from "../../../types/types";
import styles from "../../../styles/OrganizationApprovalAdmin.module.scss";

const OrganizationApprovalAdmin: NextPage = () => {
  const { user, loading, orgs, orgsLoaded } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const goBack = useBack();
  const router = useRouter();
  const { addSnack } = useSnack();

  const mapsOrg = orgs?.find((org) => org.id === MAPS_ORG_ID);
  const isMapsMember = Boolean(mapsOrg);

  /* Reading the queue is open to all of MAPS, but flipping approved is not:
     unapproving hides an organization and every one of its events from
     listings, recommendations and their own pages, platform wide. The API
     answers 403 for a plain member, so showing them the button would only
     produce a snack. */
  const isMapsAdmin = Boolean(
    mapsOrg?.organizationRoles?.some(
      (role) =>
        role.userId === user?.id &&
        (role.role === OrganizationRole.ADMIN ||
          role.role === OrganizationRole.OWNER),
    ),
  );

  /* `orgs` is fetched separately from the user and starts out empty, so
     redirecting before it has settled bounces legitimate MAPS members. */
  useEffect(() => {
    if (!loading && user && orgsLoaded && !isMapsMember) {
      router.replace("/me");
    }
  }, [isMapsMember, loading, orgsLoaded, router, user]);

  const organizationsQuery = useSWR<Organization[]>(
    user && isMapsMember ? "/organizations/admin/all" : null,
    fetchAllFromPeoplyApiJson,
  );
  const { mutate } = organizationsQuery;

  const updateApproval = async (organizationId: string, approved: boolean) => {
    try {
      await fetchFromPeoplyApi(
        `/organizations/admin/${organizationId}/approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ approved }),
        },
      );
      mutate();
    } catch {
      addSnack("Kunne ikke oppdatere foreningen", SnackTypes.ERROR);
    }
  };

  if (loading) {
    return <></>;
  }

  if (!loading && !user) {
    redirectToLogin();
    return <></>;
  }

  if (!loading && user && !isMapsMember) {
    return <></>;
  }

  return (
    <>
      <HeadComponent
        title="Admin: foreninger"
        description="Administrer godkjente foreninger"
      />
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.header}>
          <h1>Admin: foreninger</h1>
          <p>
            {isMapsAdmin
              ? "Se alle foreninger og sett approved-status."
              : "Se alle foreninger. Bare MAPS-administratorer kan endre approved-status."}
          </p>
        </div>
        <QueryState
          query={organizationsQuery}
          errorMessage="Kunne ikke hente foreninger."
        >
          {(organizations) => (
            <>
              {organizations.length === 0 && (
                <p className={styles.status}>Ingen foreninger funnet.</p>
              )}
              <div className={styles.list}>
                {organizations.map((organization) => (
                  <div key={organization.id} className={styles.item}>
                    <div className={styles.info}>
                      <div className={styles.nameRow}>
                        <p className={styles.name}>{organization.name}</p>
                        <Avatar org={organization} size="small" />
                      </div>
                      <p className={styles.meta}>
                        {organization.orgNr || organization.id}
                      </p>
                    </div>
                    {isMapsAdmin ? (
                      <Button
                        text={
                          organization.approved ? "Approved" : "Ikke approved"
                        }
                        onClick={() =>
                          updateApproval(
                            organization.id,
                            !organization.approved,
                          )
                        }
                        className={styles.button}
                      />
                    ) : (
                      <p className={styles.readOnlyStatus}>
                        {organization.approved ? "Approved" : "Ikke approved"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </QueryState>
      </div>
    </>
  );
};

export default OrganizationApprovalAdmin;
