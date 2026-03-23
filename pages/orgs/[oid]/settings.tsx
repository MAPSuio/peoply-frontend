import { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import useSWR from "swr";
import Navbar from "../../../components/Navbar";
import OrgMenu from "../../../components/OrgMenu";
import useSnack from "../../../hooks/useSnack";
import {
  ButtonSize,
  ButtonType,
  IcsFeedSyncStatus,
  OrganizationIcsFeed,
  SnackTypes,
} from "../../../types/types";
import styles from "../../../styles/OrganizationSettings.module.scss";
import useBack from "../../../hooks/useBack";
import BackButton from "../../../components/BackButton";
import useOrganization from "../../../hooks/useOrganization";
import TextInput from "../../../components/inputs/TextInput";
import Button from "../../../components/Button";
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

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
  const [icsUrl, setIcsUrl] = useState("");
  const [validIcsUrl, setValidIcsUrl] = useState(true);

  const { data: icsFeed, mutate: mutateIcsFeed } =
    useSWR<OrganizationIcsFeed | null>(
      () => (org?.id ? `/organizations/${org.id}/ics-feed` : false),
      fetchFromPeoplyApiJson,
    );

  useEffect(() => {
    if (icsFeed?.url) {
      setIcsUrl(icsFeed.url);
    } else {
      setIcsUrl("");
    }
  }, [icsFeed]);

  useEffect(() => {
    if (!orgLoading && (orgError || !org)) {
      addSnack(
        "Kunne ikke laste inn data for organisasjonen.",
        SnackTypes.ERROR,
      );
      router.push("/");
    }
  }, [addSnack, org, orgError, orgLoading, router]);

  useEffect(() => {
    if (!orgLoading && org && !isAdminOrOwner) {
      addSnack("Du har ikke rettigheter til dette.", SnackTypes.ERROR);
      router.push(`/orgs/${oid}`);
    }
  }, [addSnack, isAdminOrOwner, oid, org, orgLoading, router]);

  if (orgLoading) {
    return <></>;
  }

  if (orgError || !org || !isAdminOrOwner) {
    return <></>;
  }

  const updateIcsUrl = (event: ChangeEvent<HTMLInputElement>) => {
    setIcsUrl(event.target.value.trim());
  };

  const hasChanges = (icsFeed?.url ?? "") !== icsUrl;

  const getStatusLabel = () => {
    switch (icsFeed?.lastSyncStatus) {
      case IcsFeedSyncStatus.SUCCESS:
        return "Vellykket";
      case IcsFeedSyncStatus.FAILED:
        return "Feilet";
      case IcsFeedSyncStatus.RUNNING:
        return "Kjører";
      case IcsFeedSyncStatus.DISABLED:
        return "Deaktivert";
      default:
        return "Venter på første synk";
    }
  };

  const getFormattedTimestamp = (value?: string | null) => {
    if (!value) {
      return "Ikke kjørt ennå";
    }

    return new Date(value).toLocaleString("nb-NO");
  };

  const handleSave = async () => {
    try {
      await fetchFromPeoplyApiJson(`/organizations/${org.id}/ics-feed`, {
        method: "PUT",
        body: JSON.stringify({ url: icsUrl }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      await mutateIcsFeed();
      addSnack("ICS-integrasjonen er oppdatert", SnackTypes.SUCCESS);
    } catch (error: unknown) {
      const status =
        error instanceof Response
          ? error.status
          : (error as { status?: number; statusCode?: number })?.status ??
            (error as { status?: number; statusCode?: number })?.statusCode;

      addSnack(
        status === 400
          ? "URL-en må være en gyldig offentlig HTTPS-ICS-feed"
          : "Klarte ikke å lagre ICS-integrasjonen",
        SnackTypes.ERROR,
      );
    }
  };

  const handleSync = async () => {
    try {
      await fetchFromPeoplyApiJson(`/organizations/${org.id}/ics-feed/sync`, {
        method: "POST",
      });
      await mutateIcsFeed();
      addSnack("Manuell synkronisering fullført", SnackTypes.SUCCESS);
    } catch {
      addSnack("Klarte ikke å starte synkronisering", SnackTypes.ERROR);
    }
  };

  const handleDelete = async () => {
    try {
      await fetchFromPeoplyApiJson(`/organizations/${org.id}/ics-feed`, {
        method: "DELETE",
      });
      setIcsUrl("");
      await mutateIcsFeed(null, false);
      addSnack("ICS-integrasjonen er fjernet", SnackTypes.SUCCESS);
    } catch {
      addSnack("Klarte ikke å fjerne ICS-integrasjonen", SnackTypes.ERROR);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <div className={styles.header}>
        <h1>Innstillinger</h1>
        <p>Organisasjonsbehandling for {org.name}</p>
      </div>
      <OrgMenu org={org} />
      <section className={styles.integrationCard}>
        <div className={styles.integrationHeader}>
          <h2>Kalenderintegrasjon (.ics)</h2>
          <p>
            Legg inn én offentlig HTTPS-ICS-feed for organisasjonen. Importerte
            arrangementer blir synkronisert automatisk og kan ikke redigeres{" "}
            manuelt i Peoply.
          </p>
        </div>
        <TextInput
          value={icsUrl}
          handleChange={updateIcsUrl}
          inputName="icsUrl"
          inputId="icsUrl"
          label="ICS-URL"
          placeholder="https://example.org/calendar.ics"
          maxLength={500}
          minLength={8}
          errorMessage="Skriv inn en gyldig offentlig HTTPS-URL"
          regExp={/^https:\/\/.+/}
          valid={validIcsUrl}
          setValid={setValidIcsUrl}
          validate
        />
        <div className={styles.buttonRow}>
          <Button
            text={icsFeed ? "Oppdater URL" : "Lagre URL"}
            onClick={handleSave}
            disabled={!icsUrl || !validIcsUrl || !hasChanges}
            size={ButtonSize.SMALL}
          />
          <Button
            text="Synk nå"
            onClick={handleSync}
            disabled={!icsFeed}
            size={ButtonSize.SMALL}
            type={ButtonType.SECONDARY}
          />
          <Button
            text="Fjern integrasjon"
            onClick={handleDelete}
            disabled={!icsFeed}
            size={ButtonSize.SMALL}
            type={ButtonType.DANGERSOFT}
          />
        </div>
        <div className={styles.statusCard}>
          <p>
            <strong>Status:</strong>{" "}
            {icsFeed ? getStatusLabel() : "Ikke satt opp"}
          </p>
          <p>
            <strong>Sist synkronisert:</strong>{" "}
            {getFormattedTimestamp(icsFeed?.lastSyncedAt)}
          </p>
          <p>
            <strong>Vellykket sist:</strong>{" "}
            {getFormattedTimestamp(icsFeed?.lastSuccessfulSyncAt)}
          </p>
          <p>
            <strong>Synkintervall:</strong> {icsFeed?.syncIntervalMinutes ?? 60}{" "}
            min
          </p>
          {icsFeed?.lastSyncError && (
            <p className={styles.errorText}>
              <strong>Siste feil:</strong> {icsFeed.lastSyncError}
            </p>
          )}
        </div>
      </section>
      <Navbar />
    </div>
  );
};

export default OrganizationSettings;
