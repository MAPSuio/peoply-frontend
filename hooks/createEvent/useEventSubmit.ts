import { useRouter } from "next/router";

import useRedirectToLogin from "../useRedirectToLogin";
import useSnack from "../useSnack";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import { type Event, SnackTypes, type User } from "../../types/types";
import { clearStoredDraft } from "./eventDraft";

export default function useEventSubmit(user: User | undefined) {
  const router = useRouter();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();

  const summaryPageOnClick = async (formData: FormData) => {
    if (!user) {
      return redirectToLogin();
    }

    try {
      const event: Event = await fetchFromPeoplyApiJson("/events", {
        method: "post",
        body: formData,
      });
      addSnack("Ditt arrangement har blitt opprettet", SnackTypes.SUCCESS);
      clearStoredDraft();
      router.replace(`/events/${event.urlId}`);
    } catch {
      addSnack(
        "Det skjedde en feil under opprettelsen av arrangementet",
        SnackTypes.ERROR,
      );
    }
  };

  return { summaryPageOnClick };
}
