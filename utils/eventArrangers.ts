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

  return `${items
    .slice(0, maxVisible)
    .map((item) => item.label)
    .join(" · ")} +${items.length - maxVisible}`;
}
