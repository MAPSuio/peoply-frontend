import { useCallback } from "react";

import useFavoritedEventIds from "./useFavoritedEventIds";
import useRedirectToLogin from "./useRedirectToLogin";
import useSnack from "./useSnack";
import useUser from "./useUser";
import { addFavorite, removeFavorite } from "../services/events";
import { SnackTypes } from "../types/types";

export default function useEventFavorite(eventId?: string) {
  const { user } = useUser();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();
  const {
    favorited: favoritedEventIds,
    loading,
    setFavorited,
  } = useFavoritedEventIds();

  const favorited = eventId !== undefined && favoritedEventIds.has(eventId);

  const toggleFavorite = useCallback(
    async (clickEvent?: { preventDefault: () => void }) => {
      clickEvent?.preventDefault();

      if (!user || !eventId) {
        redirectToLogin();
        return;
      }

      const written = favorited
        ? await removeFavorite(user.id, eventId)
        : await addFavorite(user.id, eventId);

      if (!written) {
        addSnack(
          favorited
            ? "Klarte ikke å fjerne favoritt"
            : "Klarte ikke å legge til favoritt",
          SnackTypes.ERROR,
        );
        return;
      }

      await setFavorited(eventId, !favorited);
    },
    [addSnack, eventId, favorited, redirectToLogin, setFavorited, user],
  );

  return { favorited, loading, toggleFavorite };
}
