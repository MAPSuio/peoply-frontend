import { useCallback, useEffect, useState } from "react";

import useRedirectToLogin from "./useRedirectToLogin";
import useSnack from "./useSnack";
import useUser from "./useUser";
import {
  addFavorite,
  getUserFavorite,
  removeFavorite,
} from "../services/events";
import { SnackTypes } from "../types/types";

/**
 * Favorite state for a single event, including the toggle and the
 * not-logged-in redirect.
 *
 * `loading` stays true until we know the current state, so the heart can be
 * disabled rather than briefly rendering "not favorited" for an event the user
 * has already favorited.
 */
export default function useEventFavorite(eventId?: string) {
  const { user, loading: loadingUser } = useUser();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();

  const [favorited, setFavorited] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    let active = true;

    const loadFavoriteStatus = async () => {
      if (!user) {
        /* Wait for the auth bootstrap before concluding nobody is logged in. */
        if (!loadingUser) {
          setFetched(true);
        }
        return;
      }

      try {
        const favorite = await getUserFavorite(user.id, eventId);

        if (active) {
          setFavorited(favorite !== null);
          setFetched(true);
        }
      } catch {
        /* Treat an unreachable favorite endpoint as "not favorited" rather
           than leaving the heart disabled forever. */
        if (active) {
          setFetched(true);
        }
      }
    };

    loadFavoriteStatus();

    return () => {
      active = false;
    };
  }, [eventId, loadingUser, user]);

  const toggleFavorite = useCallback(
    async (clickEvent?: { preventDefault: () => void }) => {
      clickEvent?.preventDefault();

      if (!user || !eventId) {
        redirectToLogin();
        return;
      }

      const success = favorited
        ? await removeFavorite(user.id, eventId)
        : await addFavorite(user.id, eventId);

      if (!success) {
        addSnack(
          favorited
            ? "Klarte ikke å fjerne favoritt"
            : "Klarte ikke å legge til favoritt",
          SnackTypes.ERROR,
        );
        return;
      }

      setFavorited(!favorited);
    },
    [addSnack, eventId, favorited, redirectToLogin, user],
  );

  return { favorited, loading: !fetched, toggleFavorite };
}
