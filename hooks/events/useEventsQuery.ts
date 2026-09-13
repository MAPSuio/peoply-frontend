import { useRouter } from "next/router";
import { useMemo } from "react";
import useSWR, { type SWRResponse } from "swr";

import {
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApiJson,
} from "../../services/fetchers";
import type { Event } from "../../types/types";
import { buildEventsQuery, hasExplicitTake } from "../../utils/eventListing";
import { queryToString } from "../../utils/functions";

export default function useEventsQuery(): SWRResponse<Event[]> {
  const router = useRouter();
  const takeIsExplicit = hasExplicitTake(router.query);

  const queryUrl = useMemo(
    () =>
      `/events?${queryToString(buildEventsQuery(router.query, new Date()))}`,
    [router.query],
  );

  return useSWR<Event[]>(
    queryUrl,
    takeIsExplicit ? fetchFromPeoplyApiJson : fetchAllFromPeoplyApiJson,
  );
}
