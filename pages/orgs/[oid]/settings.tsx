import { NextPage } from "next";
import { useRouter } from "next/router";
import Navbar from "../../../components/Navbar";
import OrgMenu from "../../../components/OrgMenu";
import useSnack from "../../../hooks/useSnack";
import { SnackTypes } from "../../../types/types";
import styles from "../../../styles/OrganizationSettings.module.scss";
import useBack from "../../../hooks/useBack";
import BackButton from "../../../components/BackButton";
import useOrganization from "../../../hooks/useOrganization";

const OrganizationSettings: NextPage = () => {
  const router = useRouter();
  const goBack = useBack();
  const { oid } = router.query;
  const { addSnack } = useSnack();
  const {
    organization: org,
    isAdminOrOwner,
    loading: orgLoading,
    error: orgError,
  } = useOrganization(oid as string);

  if (orgLoading) {
    return <></>;
  }

  if (orgError || !org) {
    addSnack("Kunne ikke laste inn data for organisasjonen.", SnackTypes.ERROR);
    router.push("/");
    return <></>;
  }

  if (!isAdminOrOwner) {
    addSnack("Du har ikke rettigheter til dette.", SnackTypes.ERROR);
    router.push(`/orgs/${oid}`);
  }

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <div className={styles.header}>
        <h1>Innstillinger</h1>
        <p>Organisasjonsbehandling for {org.name}</p>
      </div>
      <OrgMenu org={org} />
      <Navbar />
    </div>
  );
};

export default OrganizationSettings;
