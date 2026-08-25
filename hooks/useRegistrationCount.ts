import useSWR from "swr";

import { type Event, RegStatus } from "../types/types";
import { showsRegistrationCount } from "../utils/event";

/**
 * Number of people going to an event.
 *
 * `GET /events` and `GET /events/:id` both carry `goingCount`, so a caller
 * that already holds the event has the number in hand and there is nothing to
 * fetch. That matters in lists: every card used to ask for its own count, so
 * the front page was ten extra requests and `/events` with 30 cards was
 * thirty, and the numbers appeared well after the cards they belong to.
 *
 * The request is not removed, only skipped. Events reached through endpoints
 * that do not carry the count (a user's registrations or favourites, say) pass
 * an event without `goingCount` and fetch exactly as before, so this does not
 * depend on the backend and the frontend deploying in any particular order.
 *
 * `mutate()` still revalidates against the API, which is what keeps the count
 * moving when someone joins or leaves from the card itself: the seeded value
 * is a starting point, not a ceiling.
 *
 * Focus revalidation is off. A feed holds one of these per card, and SWR's
 * default refires every mounted key each time the app regains focus - on
 * mobile that is every app switch, and it made this endpoint alone a seventh
 * of all backend traffic. An unseeded count still fetches on mount, and a
 * seeded one still moves through mutate(); neither updates any more just
 * because the user glanced at another app.
 *
 * Events with external registration have no count to show (see
 * `showsRegistrationCount`), so they neither seed nor fetch and `data` stays
 * `undefined`. Callers still hide their own count markup - this is the
 * backstop that keeps a caller which forgets from being handed a number.
 *
 * `forDisplay: false` opts out of that gate. It is for the caller that needs
 * the number for something other than telling the user it: the edit page uses
 * it as the floor under the capacity field, and dropping it there would let an
 * arranger who switches an event to external registration set capacity below
 * the people already signed up.
 */
export default function useRegistrationCount(
  event?: Pick<Event, "id" | "goingCount" | "registrationMode">,
  { forDisplay = true }: { forDisplay?: boolean } = {},
) {
  const counted = !forDisplay || showsRegistrationCount(event);
  const seeded = counted ? event?.goingCount : undefined;

  return useSWR<number>(
    counted && event?.id
      ? `/events/${event.id}/registration-count?regStatus=${RegStatus.GOING}`
      : null,
    {
      fallbackData: seeded,
      revalidateOnMount: seeded === undefined,
      revalidateOnFocus: false,
    },
  );
}
