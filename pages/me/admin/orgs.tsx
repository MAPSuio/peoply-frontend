import type { NextPage } from "next";
import useSWR from "swr";
import { useRouter } from "next/router";
import { useEffect } from "react";

import BackButton from "../../../components/BackButton";
import Avatar from "../../../components/Avatar";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import useBack from "../../../hooks/useBack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import { MAPS_ORG_ID } from "../../../constants/organizations";
import {
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApi,
} from "../../../services/fetchers";
import { type Organization, SnackTypes } from "../../../types/types";
import styles from "../../../styles/OrganizationApprovalAdmin.module.scss";

const OrganizationApprovalAdmin: NextPage = () => {
  const { user, loading, orgs } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const goBack = useBack();
  const router = useRouter();
  const { addSnack } = useSnack();

  const isMapsMember = orgs?.some((org) => org.id === MAPS_ORG_ID);

  useEffect(() => {
    if (!loading && user && !isMapsMember) {
      router.replace("/me");
    }
  }, [isMapsMember, loading, router, user]);

  const {
    data: organizations,
    error,
    mutate,
  } = useSWR<Organization[]>(
    user && isMapsMember ? "/organizations/admin/all" : null,
    fetchAllFromPeoplyApiJson,
  );

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
          <p>Se alle foreninger og sett approved-status.</p>
        </div>
        {error && <p className={styles.status}>Kunne ikke hente foreninger.</p>}
        {!error && organizations && organizations.length === 0 && (
          <p className={styles.status}>Ingen foreninger funnet.</p>
        )}
        <div className={styles.list}>
          {organizations?.map((organization) => (
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
              <Button
                text={organization.approved ? "Approved" : "Ikke approved"}
                onClick={() =>
                  updateApproval(organization.id, !organization.approved)
                }
                className={styles.button}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default OrganizationApprovalAdmin;
