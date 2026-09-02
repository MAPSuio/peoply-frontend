import type { Event, Organization, User } from "../types/types";
import { getPrimaryEventArranger } from "./eventArrangers";

export type AvatarUser = Pick<User, "id" | "image" | "firstName" | "lastName">;
export type AvatarOrganization = Pick<Organization, "id" | "image" | "name">;

export type AvatarSubject =
  | { type: "user"; user: AvatarUser }
  | { type: "organization"; organization: AvatarOrganization };

export type AvatarContent =
  | { type: "image"; src: string; alt: string }
  | { type: "mascot"; seed: string; alt: string }
  | { type: "initials"; text: string; alt: string };

function getUserName(user: AvatarUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getAvatarContent(subject: AvatarSubject): AvatarContent {
  if (subject.type === "organization") {
    const { organization } = subject;
    const alt = organization.name;

    return organization.image
      ? { type: "image", src: organization.image, alt }
      : {
          type: "initials",
          text: organization.name.charAt(0).toUpperCase(),
          alt,
        };
  }

  const { user } = subject;
  const alt = `Profilbilde av ${getUserName(user)}`;

  return user.image
    ? { type: "image", src: user.image, alt }
    : { type: "mascot", seed: user.id, alt };
}

export const PEOPLY_AVATAR: AvatarContent = {
  type: "initials",
  text: "P",
  alt: "Peoply",
};

export function getEventArrangerAvatarContent(
  event: Event,
): AvatarContent | null {
  const arranger = getPrimaryEventArranger(event);

  if (arranger?.organization) {
    return getAvatarContent({
      type: "organization",
      organization: arranger.organization,
    });
  }

  if (arranger?.user) {
    return getAvatarContent({ type: "user", user: arranger.user });
  }

  return null;
}
