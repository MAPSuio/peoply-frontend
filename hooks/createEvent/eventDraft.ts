export type { ArrangerOption, EventObjectProps } from "../../types/types";

import {
  type EventObjectProps,
  ImageCaching,
  Visibility,
} from "../../types/types";

export const STEP_COUNT = 7;

export const IMAGE_CACHE_LIMIT_BYTES = 4500000;

const DRAFT_KEY = "eventObject";

const IMAGE_KEY = "eventImage";

export function emptyEventDraft(arrangerId: string): EventObjectProps {
  return {
    eventTitle: "",
    eventArrangerId: arrangerId,
    eventCoOrganizerOrganizationIds: [],
    eventDescription: "",
    eventLocationName: "",
    eventRegStartDate: "",
    eventRegStartTime: "",
    eventRegEndDate: "",
    eventRegEndTime: "",
    eventHasRegStart: false,
    eventHasRegEnd: false,
    eventDateStart: "",
    eventDateEnd: null,
    eventHasDateEnd: false,
    eventTimeStart: "",
    eventTimeEnd: null,
    eventActiveCategories: [],
    eventVisibility: Visibility.PUBLIC,
    eventHasCapacity: false,
    eventHasFood: false,
    eventHasExternalRegistration: false,
    eventExternalUrl: "",
    eventHasFormQuestion: false,
    eventFormQuestion: "",
    eventImage: undefined,
    eventCapacity: "",
    eventExtraInfoValid: false,
    eventImageValid: false,
    currentStep: 0,
    imageStorageKey: "",
    reachedStep: 0,
    imageCached: ImageCaching.OK,
  };
}

export function toggled<Item>(items: Item[], item: Item): Item[] {
  return items.includes(item)
    ? items.filter((candidate) => candidate !== item)
    : [...items, item];
}

export function hasStoredDraft(): boolean {
  return localStorage.getItem(DRAFT_KEY) !== null;
}

export function writeStoredDraft(draft: EventObjectProps): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function readStoredDraft(): EventObjectProps | null {
  const stored = localStorage.getItem(DRAFT_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    clearStoredDraft();
    return null;
  }
}

export function clearStoredDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(IMAGE_KEY);
}

export function readStoredImage(): string | null {
  return localStorage.getItem(IMAGE_KEY);
}

export function writeStoredImage(dataUrl: string): void {
  localStorage.setItem(IMAGE_KEY, dataUrl);
}

export function clearStoredImage(): void {
  localStorage.removeItem(IMAGE_KEY);
}

export function draftWithFieldsOlderBuildsOmitted(
  stored: EventObjectProps,
  signedInArrangerId: string | undefined,
): EventObjectProps {
  return {
    ...stored,
    eventHasExternalRegistration: stored.eventHasExternalRegistration ?? false,
    eventExternalUrl: stored.eventExternalUrl ?? "",
    eventCoOrganizerOrganizationIds:
      stored.eventCoOrganizerOrganizationIds ?? [],
    eventArrangerId: stored.eventArrangerId || (signedInArrangerId ?? ""),
  };
}
