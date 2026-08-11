import type {
  EventCoOrganizerInvitation,
  InvitationStatus,
} from "../types/types";
import { fetchFromPeoplyApi, fetchFromPeoplyApiJson } from "./fetchers";

/* Every co-organizer invitation on an event. Only the event's own arrangers
   may read this - the API answers 403 for everyone else. */
export function getCoOrganizerInvitations(
  eventId: string,
): Promise<EventCoOrganizerInvitation[]> {
  return fetchFromPeoplyApiJson(`/events/${eventId}/coorganizer-invitations`);
}

/* Answers one invitation on behalf of the invited organization. ACCEPTED is
   what puts the organization's name and logo on the event - nothing about it
   is shown there before that. */
export function respondToCoOrganizerInvitation(
  eventId: string,
  invitationId: string,
  status: InvitationStatus,
) {
  return fetchFromPeoplyApi(
    `/events/${eventId}/coorganizer-invitations/${invitationId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ status }),
    },
  );
}
