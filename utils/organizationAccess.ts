import { blockingReason } from "../hooks/useRedirectWithReason";

/**
 * Who may see what inside an organization, in one place.
 *
 * Each page used to spell out its own "not while loading, not before the user
 * is known, and here is why you cannot stay" chain, and they had already
 * drifted: the same 403 was reported as a fetch failure on one page and as a
 * missing right on another. Every answer is undefined while the page is still
 * loading - a guard that fires on half-loaded data sends people away before
 * anyone knows whether it had to.
 */

export interface AccessContext {
  /** Nothing is decided while the page is still fetching its answer. */
  loading?: boolean;
  signedIn: boolean;
}

export interface MemberListAccess extends AccessContext {
  hasMembers: boolean;
  /** The API refused the list, which for an outsider is the expected answer. */
  forbidden?: boolean;
}

export function memberListBlockedReason({
  loading,
  signedIn,
  hasMembers,
  forbidden,
}: MemberListAccess): string | undefined {
  return blockingReason(!loading && signedIn && !hasMembers, [
    {
      blocked: Boolean(forbidden),
      reason: "Bare medlemmer kan se medlemslisten",
    },
    { blocked: true, reason: "Kunne ikke hente medlemslisten" },
  ]);
}

export interface FollowerListAccess extends AccessContext {
  hasOrganization: boolean;
  isAdminOrOwner?: boolean;
}

export function followerListBlockedReason({
  loading,
  signedIn,
  hasOrganization,
  isAdminOrOwner,
}: FollowerListAccess): string | undefined {
  return blockingReason(!loading && signedIn && hasOrganization, [
    {
      blocked: isAdminOrOwner === false,
      reason: "Du har ikke tilgang til følgerlisten",
    },
  ]);
}

export interface InviteAccess extends AccessContext {
  isAdminOrOwner?: boolean;
  fetchFailed: boolean;
}

/* A signed-out visitor belongs on the login page, not on a page telling them
   they lack a right they were never asked for. */
export function inviteBlockedReason({
  loading,
  signedIn,
  isAdminOrOwner,
  fetchFailed,
}: InviteAccess): string | undefined {
  return blockingReason(!loading && signedIn && !isAdminOrOwner, [
    { blocked: fetchFailed, reason: "Kunne ikke hente organisasjonsdata" },
    {
      blocked: true,
      reason: "Du har ikke rettigheter til å invitere nye medlemmer",
    },
  ]);
}

export interface MemberEditAccess {
  loading?: boolean;
  fetchFailed: boolean;
  canEdit?: boolean;
  isMemberOfOrganization: boolean;
}

export function memberEditBlockedReason({
  loading,
  fetchFailed,
  canEdit,
  isMemberOfOrganization,
}: MemberEditAccess): string | undefined {
  return blockingReason(!loading, [
    { blocked: fetchFailed, reason: "Noe gikk galt" },
    { blocked: !canEdit, reason: "Du har ikke rettigheter til dette" },
    {
      blocked: !isMemberOfOrganization,
      reason: "Denne brukeren er ikke medlem i organisasjonen",
    },
  ]);
}
