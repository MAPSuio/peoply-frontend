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

export function hasStoredDraft(): boolean {
  return localStorage.getItem(DRAFT_KEY) !== null;
}

export function writeStoredDraft(draft: EventObjectProps): void {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function isDraftObject(parsed: unknown): parsed is EventObjectProps {
  return (
    typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
  );
}

function parseDraft(stored: string): EventObjectProps | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    return isDraftObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readStoredDraft(): EventObjectProps | null {
  const stored = localStorage.getItem(DRAFT_KEY);

  if (!stored) {
    return null;
  }

  const draft = parseDraft(stored);

  if (!draft) {
    clearStoredDraft();
  }

  return draft;
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
    ...emptyEventDraft(signedInArrangerId ?? ""),
    ...stored,
    eventArrangerId: stored.eventArrangerId || (signedInArrangerId ?? ""),
  };
}
