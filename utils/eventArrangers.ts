import type { ArrangerPalette } from "./arrangerColor";
import type { Event, EventArranger, Organization } from "../types/types";

export interface EventArrangerDisplayItem {
  id: string;
  href: string;
  isVerifiedOrganization: boolean;
  label: string;
}

function getArrangerLabel(eventArranger: EventArranger) {
  if (eventArranger.arranger.organization) {
    return eventArranger.arranger.organization.name;
  }

  if (eventArranger.arranger.user) {
    return `${eventArranger.arranger.user.firstName} ${eventArranger.arranger.user.lastName}`.trim();
  }

  return "Peoply";
}

export function getPrimaryEventArranger(event: Event) {
  return event.eventArrangers?.[0]?.arranger;
}

export function getPrimaryEventArrangerOrganization(
  event: Event,
): Organization | undefined {
  return getPrimaryEventArranger(event)?.organization;
}

// Stable key for deriving a per-arranger color: the organization id when the
// primary arranger is an org, otherwise the user id, otherwise the shared
// Peoply fallback.
export function getPrimaryEventArrangerColorKey(event: Event): string {
  const arranger = getPrimaryEventArranger(event);
  return arranger?.organization?.id ?? arranger?.user?.id ?? "peoply";
}

export function getPrimaryEventArrangerImage(event: Event) {
  const arranger = getPrimaryEventArranger(event);
  return arranger?.organization?.image ?? arranger?.user?.image;
}

export function getPrimaryEventArrangerPalette(
  event: Event,
): ArrangerPalette | undefined {
  const organization = getPrimaryEventArrangerOrganization(event);
  if (!organization?.imagePrimaryColor) return undefined;

  return {
    primary: organization.imagePrimaryColor,
    accent: organization.imageAccentColor ?? null,
  };
}

export function getPrimaryEventArrangerInitial(event: Event) {
  const eventArranger = event.eventArrangers?.[0];
  const name = eventArranger ? getArrangerLabel(eventArranger) : "Peoply";
  return name.charAt(0).toUpperCase();
}

export function getEventArrangerDisplayItems(
  event: Event,
): EventArrangerDisplayItem[] {
  return (event.eventArrangers ?? []).map((eventArranger) => {
    const organization = eventArranger.arranger.organization;
    const user = eventArranger.arranger.user;

    return {
      id: eventArranger.arrangerId,
      href: organization
        ? `/orgs/${organization.urlId ?? organization.id}`
        : `/users/${user?.id}`,
      isVerifiedOrganization: Boolean(organization?.orgNr),
      label: getArrangerLabel(eventArranger),
    };
  });
}

export function getCompactEventArrangerLabel(event: Event, maxVisible = 1) {
  const items = getEventArrangerDisplayItems(event);

  if (items.length === 0) {
    return "Peoply";
  }

  if (items.length <= maxVisible) {
    return items.map((item) => item.label).join(" · ");
  }

  const hidden = items.length - maxVisible;
  const visible = items
    .slice(0, maxVisible)
    .map((item) => item.label)
    .join(" · ");

  return hidden === 1
    ? `${visible} og 1 annen arrangør`
    : `${visible} og ${hidden} andre arrangører`;
}
