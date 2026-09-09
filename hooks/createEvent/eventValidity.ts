import {
  eventDescriptionMaxLength,
  eventDescriptionMinLength,
  eventLocationNameMaxLength,
  eventLocationNameMinLength,
  eventTitleMaxLength,
  eventTitleMinLength,
} from "../../utils/constants";
import {
  isEventRegEndDateValid,
  isEventRegEndTimeValid,
  isEventRegStartDateValid,
  isEventRegStartTimeValid,
} from "../../utils/event";
import {
  dateInputEndValid,
  dateInputStartValid,
  radioInputValid,
  timeInputEndValid,
  timeInputStartValid,
} from "../../utils/functions";
import type { EventObjectProps } from "./eventDraft";

const MAX_CAPACITY = 10000;

const EXTERNAL_URL = /^https?:\/\/\S+$/i;

function lengthWithin(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

export function isTitleFilledIn(draft: EventObjectProps): boolean {
  return lengthWithin(
    draft.eventTitle,
    eventTitleMinLength,
    eventTitleMaxLength,
  );
}

export function isAddressFilledIn(draft: EventObjectProps): boolean {
  return lengthWithin(
    draft.eventLocationName,
    eventLocationNameMinLength,
    eventLocationNameMaxLength,
  );
}

export function isDescriptionFilledIn(draft: EventObjectProps): boolean {
  return (
    lengthWithin(
      draft.eventDescription,
      eventDescriptionMinLength,
      eventDescriptionMaxLength,
    ) && draft.eventActiveCategories.length > 0
  );
}

export function isExternalUrlValid(draft: EventObjectProps): boolean {
  return (
    !draft.eventHasExternalRegistration ||
    EXTERNAL_URL.test(draft.eventExternalUrl.trim())
  );
}

export function isCapacityValid(draft: EventObjectProps): boolean {
  return radioInputValid(
    draft.eventHasCapacity,
    parseInt(draft.eventCapacity, 10),
    0,
    MAX_CAPACITY,
  );
}

export interface DateValidity {
  eventDateStartValid: boolean;
  eventTimeStartValid: boolean;
  eventDateEndValid: boolean;
  eventTimeEndValid: boolean;
}

export function deriveDateValidity(draft: EventObjectProps): DateValidity {
  const { eventDateStart, eventTimeStart, eventDateEnd, eventTimeEnd } = draft;
  const bothEndPartsSet = Boolean(eventDateEnd && eventTimeEnd);
  const noEndPartSet = !eventDateEnd && !eventTimeEnd;

  return {
    eventDateStartValid: dateInputStartValid(eventDateStart),
    eventTimeStartValid: timeInputStartValid(eventTimeStart, eventDateStart),
    eventDateEndValid: eventDateEnd
      ? dateInputEndValid(eventDateStart, eventDateEnd)
      : true,
    eventTimeEndValid: bothEndPartsSet
      ? timeInputEndValid(
          eventTimeStart,
          eventTimeEnd ?? "",
          eventDateStart,
          eventDateEnd ?? "",
        )
      : noEndPartSet,
  };
}

export interface RegistrationValidity {
  regStartDateValid: boolean;
  regStartTimeValid: boolean;
  regEndDateValid: boolean;
  regEndTimeValid: boolean;
}

export function deriveRegistrationValidity(
  draft: EventObjectProps,
): RegistrationValidity {
  const {
    eventRegStartDate,
    eventRegStartTime,
    eventRegEndDate,
    eventRegEndTime,
    eventDateStart,
    eventTimeStart,
    eventDateEnd,
    eventTimeEnd,
    eventHasRegStart,
    eventHasRegEnd,
  } = draft;

  return {
    regStartDateValid:
      !eventHasRegStart ||
      isEventRegStartDateValid(eventRegStartDate, eventDateStart),
    regStartTimeValid:
      !eventHasRegStart ||
      isEventRegStartTimeValid(
        eventRegStartDate,
        eventRegStartTime,
        eventDateStart,
        eventTimeStart,
      ),
    regEndDateValid:
      !eventHasRegEnd ||
      isEventRegEndDateValid(
        eventRegStartDate,
        eventRegEndDate,
        eventDateStart,
      ),
    regEndTimeValid:
      !eventHasRegEnd ||
      isEventRegEndTimeValid(
        eventRegStartDate,
        eventRegStartTime,
        eventRegEndDate,
        eventRegEndTime,
        eventDateEnd ?? undefined,
        eventTimeEnd ?? undefined,
      ),
  };
}
