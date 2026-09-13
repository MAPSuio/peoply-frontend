import { useCallback, useMemo } from "react";
import useSWR from "swr";

import useUser from "./useUser";
import { fetchAllFromPeoplyApiJson } from "../services/fetchers";
import type { FavoriteData } from "../types/types";

async function fetchFavoritedEventIds(resource: string) {
  const favorites = await fetchAllFromPeoplyApiJson<FavoriteData>(resource);
  return favorites.map((favorite) => favorite.eventId);
}

export default function useFavoritedEventIds() {
  const { user, loading: loadingUser } = useUser();

  const {
    data: favoritedEventIds,
    isLoading,
    mutate,
  } = useSWR<string[]>(
    user ? `/users/${user.id}/favorites` : null,
    fetchFavoritedEventIds,
    { revalidateOnFocus: false },
  );

  const favorited = useMemo(
    () => new Set(favoritedEventIds),
    [favoritedEventIds],
  );

  const setFavorited = useCallback(
    (eventId: string, isFavorited: boolean) =>
      mutate(
        (eventIds = []) =>
          isFavorited
            ? [...eventIds, eventId]
            : eventIds.filter((favoritedId) => favoritedId !== eventId),
        { revalidate: false },
      ),
    [mutate],
  );

  return { favorited, loading: loadingUser || isLoading, setFavorited };
}
