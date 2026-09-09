import { useRouter } from "next/router";
import { useMemo } from "react";
import useSWR, { type SWRResponse } from "swr";

import {
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApiJson,
} from "../../services/fetchers";
import type { Event } from "../../types/types";
import { buildEventsQuery } from "../../utils/eventListing";
import { queryToString } from "../../utils/functions";

export default function useEventsQuery(): SWRResponse<Event[]> {
  const router = useRouter();
  const hasExplicitTake = typeof router.query.take === "string";

  const queryUrl = useMemo(
    () =>
      `/events?${queryToString(buildEventsQuery(router.query, new Date()))}`,
    [router.query],
  );

  return useSWR<Event[]>(
    queryUrl,
    hasExplicitTake ? fetchFromPeoplyApiJson : fetchAllFromPeoplyApiJson,
  );
}
