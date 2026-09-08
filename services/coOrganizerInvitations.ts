import type { InvitationStatus } from "../types/types";
import { fetchFromPeoplyApi } from "./fetchers";

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
