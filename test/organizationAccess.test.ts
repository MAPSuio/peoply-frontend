import { describe, expect, it } from "vitest";

import {
  followerListBlockedReason,
  inviteBlockedReason,
  memberEditBlockedReason,
  memberListBlockedReason,
} from "../utils/organizationAccess";

describe("memberListBlockedReason", () => {
  it("says nothing while the list is still loading", () => {
    expect(
      memberListBlockedReason({
        loading: true,
        signedIn: true,
        hasMembers: false,
      }),
    ).toBeUndefined();
  });

  it("says nothing to a member who has the list", () => {
    expect(
      memberListBlockedReason({ signedIn: true, hasMembers: true }),
    ).toBeUndefined();
  });

  it("tells an outsider the list is members only", () => {
    expect(
      memberListBlockedReason({
        signedIn: true,
        hasMembers: false,
        forbidden: true,
      }),
    ).toBe("Bare medlemmer kan se medlemslisten");
  });

  it("blames the fetch when the API did not refuse", () => {
    expect(
      memberListBlockedReason({
        signedIn: true,
        hasMembers: false,
        forbidden: false,
      }),
    ).toBe("Kunne ikke hente medlemslisten");
  });

  it("leaves a signed-out visitor to the login redirect", () => {
    expect(
      memberListBlockedReason({ signedIn: false, hasMembers: false }),
    ).toBeUndefined();
  });
});

describe("followerListBlockedReason", () => {
  it("waits until the role is known rather than guessing", () => {
    expect(
      followerListBlockedReason({
        signedIn: true,
        hasOrganization: true,
        isAdminOrOwner: undefined,
      }),
    ).toBeUndefined();
  });

  it("says the organization could not be fetched rather than going blank", () => {
    expect(
      followerListBlockedReason({
        signedIn: true,
        hasOrganization: false,
        fetchFailed: true,
      }),
    ).toBe("Kunne ikke hente organisasjonen");
  });

  it("turns away someone who is not an admin", () => {
    expect(
      followerListBlockedReason({
        signedIn: true,
        hasOrganization: true,
        isAdminOrOwner: false,
      }),
    ).toBe("Du har ikke tilgang til følgerlisten");
  });

  it("lets an admin through", () => {
    expect(
      followerListBlockedReason({
        signedIn: true,
        hasOrganization: true,
        isAdminOrOwner: true,
      }),
    ).toBeUndefined();
  });
});

describe("inviteBlockedReason", () => {
  it("lets an admin through", () => {
    expect(
      inviteBlockedReason({
        signedIn: true,
        isAdminOrOwner: true,
        fetchFailed: false,
      }),
    ).toBeUndefined();
  });

  it("blames the fetch when that is what went wrong", () => {
    expect(
      inviteBlockedReason({
        signedIn: true,
        isAdminOrOwner: false,
        fetchFailed: true,
      }),
    ).toBe("Kunne ikke hente organisasjonsdata");
  });

  it("otherwise says the rights are missing", () => {
    expect(
      inviteBlockedReason({
        signedIn: true,
        isAdminOrOwner: false,
        fetchFailed: false,
      }),
    ).toBe("Du har ikke rettigheter til å invitere nye medlemmer");
  });
});

describe("memberEditBlockedReason", () => {
  const allowed = {
    signedIn: true,
    fetchFailed: false,
    canEdit: true,
    isMemberOfOrganization: true,
  };

  it("lets an editor through", () => {
    expect(memberEditBlockedReason(allowed)).toBeUndefined();
  });

  it("reports the fetch failure before anything derived from it", () => {
    expect(
      memberEditBlockedReason({
        signedIn: true,
        fetchFailed: true,
        canEdit: false,
        isMemberOfOrganization: false,
      }),
    ).toBe("Noe gikk galt");
  });

  it("reports missing rights before a missing member", () => {
    expect(
      memberEditBlockedReason({
        ...allowed,
        canEdit: false,
        isMemberOfOrganization: false,
      }),
    ).toBe("Du har ikke rettigheter til dette");
  });

  it("leaves a signed-out visitor to the login redirect", () => {
    expect(
      memberEditBlockedReason({ ...allowed, signedIn: false, canEdit: false }),
    ).toBeUndefined();
  });

  it("reports a user who is not in the organization", () => {
    expect(
      memberEditBlockedReason({ ...allowed, isMemberOfOrganization: false }),
    ).toBe("Denne brukeren er ikke medlem i organisasjonen");
  });
});
