import useSWR from "swr";

import { ApiError, apiErrorMessage } from "../services/apiError";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";
import { type Popup, SnackTypes } from "../types/types";
import type { PopupInterval } from "../components/PopupDateRangeButton";
import type { PopupPayload } from "./usePopupEditor";
import useSnack from "./useSnack";

const INTERVAL_TAKEN = 409;

export default function usePopupSchedule(enabled: boolean) {
  const { addSnack } = useSnack();
  const query = useSWR<Popup[]>(
    enabled ? "/popups" : null,
    fetchFromPeoplyApiJson,
  );

  const refresh = () => {
    query.mutate().catch(() => undefined);
  };

  const write = async (resource: string, init: RequestInit) => {
    try {
      return await fetchFromPeoplyApiJson(resource, {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === INTERVAL_TAKEN) {
        refresh();
      }
      throw error;
    }
  };

  const update = async (popupId: string, payload: Partial<PopupPayload>) => {
    await write(`/popups/${popupId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    refresh();
  };

  return {
    query,
    create: async (payload: PopupPayload) => {
      await write("/popups", { method: "POST", body: JSON.stringify(payload) });
      addSnack("Pop-upen er planlagt", SnackTypes.SUCCESS);
      refresh();
    },
    update,
    updateDates: async (popupId: string, interval: PopupInterval) => {
      try {
        await update(popupId, interval);
      } catch (error) {
        addSnack(
          apiErrorMessage(error) ?? "Kunne ikke endre tidsrommet",
          SnackTypes.ERROR,
        );
        throw error;
      }
    },
    remove: async (popupId: string) => {
      try {
        await fetchFromPeoplyApi(`/popups/${popupId}`, { method: "DELETE" });
        addSnack("Pop-upen er slettet", SnackTypes.SUCCESS);
        refresh();
        return true;
      } catch (error) {
        addSnack(
          apiErrorMessage(error) ?? "Kunne ikke slette pop-upen",
          SnackTypes.ERROR,
        );
        return false;
      }
    },
  };
}
