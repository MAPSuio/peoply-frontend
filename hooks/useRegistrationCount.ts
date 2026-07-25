import useSWR from "swr";

import { RegStatus } from "../types/types";

/**
 * Number of people going to an event. Three views built this URL by hand; one
 * place to change it if the endpoint or the status ever moves.
 */
export default function useRegistrationCount(eventId?: string) {
  return useSWR<number>(
    eventId
      ? `/events/${eventId}/registration-count?regStatus=${RegStatus.GOING}`
      : null,
  );
}
