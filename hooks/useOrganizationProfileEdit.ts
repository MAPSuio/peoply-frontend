import { useEffect, useState } from "react";
import useSWR from "swr";

import { ApiError } from "../services/apiError";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { type Organization, SnackTypes } from "../types/types";
import useSnack from "./useSnack";
import useUser from "./useUser";

const URL_ID_CONFLICT = 409;

function changedFromStored(stored: string | undefined, current: string) {
  return !(!stored && current === "") && stored !== current;
}

export default function useOrganizationProfileEdit(
  organizationId: string | undefined,
) {
  const { reload } = useUser();
  const { addSnack } = useSnack();
  const [description, setDescription] = useState("");
  const [urlId, setUrlId] = useState("");
  const [validUrlId, setValidUrlId] = useState(true);

  const { data: org, mutate } = useSWR<Organization>(() =>
    organizationId ? `/organizations/${organizationId}` : false,
  );

  useEffect(() => {
    setDescription(org?.description ?? "");
    setUrlId(org?.urlId ?? "");
  }, [org]);

  const refresh = () => {
    mutate();
    reload();
  };

  const save = async () => {
    if (!org) {
      return;
    }

    try {
      await fetchFromPeoplyApiJson(`/organizations/${org.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          description,
          urlId: urlId === "" && urlId !== org.urlId ? null : urlId,
        }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      refresh();
      addSnack("Profil oppdatert", SnackTypes.SUCCESS);
    } catch (error) {
      const conflict =
        error instanceof ApiError && error.status === URL_ID_CONFLICT;
      addSnack(
        conflict
          ? "URL-id er allerede i bruk"
          : "Klarte ikke å oppdatere profilen",
        SnackTypes.ERROR,
      );
    }
  };

  return {
    org,
    description,
    setDescription,
    urlId,
    setUrlId,
    validUrlId,
    setValidUrlId,
    validEdit:
      validUrlId &&
      (changedFromStored(org?.description, description) ||
        changedFromStored(org?.urlId, urlId)),
    refresh,
    save,
  };
}
