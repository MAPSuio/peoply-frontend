import { describe, expect, it } from "vitest";

import type { Event } from "../types/types";
import {
  type AvatarOrganization,
  type AvatarUser,
  getAvatarContent,
  getEventArrangerAvatarContent,
} from "../utils/avatar";

function user(overrides: Partial<AvatarUser> = {}): AvatarUser {
  return {
    id: "user-1",
    firstName: "Ola",
    lastName: "Nordmann",
    ...overrides,
  };
}

function organization(
  overrides: Partial<AvatarOrganization> = {},
): AvatarOrganization {
  return { id: "org-1", name: "MAPS", ...overrides };
}

function eventArrangedBy(arranger: Record<string, unknown> | null) {
  return {
    eventArrangers: arranger
      ? [{ arrangerId: "arranger-1", arranger }]
      : undefined,
  } as unknown as Event;
}

describe("getAvatarContent", () => {
  it("uses the uploaded picture when the user has one", () => {
    expect(
      getAvatarContent({ type: "user", user: user({ image: "/ola.jpg" }) }),
    ).toEqual({
      type: "image",
      src: "/ola.jpg",
      alt: "Profilbilde av Ola Nordmann",
    });
  });

  it("falls back to a mascot seeded by the user id when there is no picture", () => {
    expect(getAvatarContent({ type: "user", user: user() })).toEqual({
      type: "mascot",
      seed: "user-1",
      alt: "Profilbilde av Ola Nordmann",
    });
  });

  it("never falls back to initials for a user, whatever the name is", () => {
    for (const names of [
      { firstName: "ola", lastName: "nordmann" },
      { firstName: "Ola", lastName: "" },
      { firstName: "", lastName: "" },
    ]) {
      expect(
        getAvatarContent({ type: "user", user: user(names) }).type,
      ).not.toBe("initials");
    }
  });

  it("falls back to the organization's first letter", () => {
    expect(
      getAvatarContent({ type: "organization", organization: organization() }),
    ).toEqual({ type: "initials", text: "M", alt: "MAPS" });
  });
});

describe("getEventArrangerAvatarContent", () => {
  it("prefers the organization over the user when the arranger has both", () => {
    expect(
      getEventArrangerAvatarContent(
        eventArrangedBy({
          id: "arranger-1",
          organization: organization({ image: "/maps.png" }),
          user: user({ image: "/ola.jpg" }),
        }),
      ),
    ).toMatchObject({ type: "image", src: "/maps.png" });
  });

  it("uses the arranging user when there is no organization", () => {
    expect(
      getEventArrangerAvatarContent(
        eventArrangedBy({ id: "arranger-1", user: user() }),
      ),
    ).toMatchObject({ type: "mascot", seed: "user-1" });
  });

  it("has nothing to show when the event has no arranger", () => {
    expect(getEventArrangerAvatarContent(eventArrangedBy(null))).toBeNull();
  });
});
