import type { Dispatch, SetStateAction } from "react";

import { InputPages } from "../../types/types";
import { allEventInputsValid, getCategoryText } from "../../utils/functions";
import type { EventObjectProps } from "./eventDraft";
import {
  deriveDateValidity,
  deriveRegistrationValidity,
  isAddressFilledIn,
  isCapacityValid,
  isDescriptionFilledIn,
  isExternalUrlValid,
  isTitleFilledIn,
} from "./eventValidity";
import useLatchedValidity from "./useLatchedValidity";

const SUMMARY_STEP = 6;

export interface StepValidityState {
  eventImageValid: boolean;
  setEventImageValid: Dispatch<SetStateAction<boolean>>;
  eventExtraInfoValid: boolean;
  setEventExtraInfoValid: Dispatch<SetStateAction<boolean>>;
}

export default function useStepValidity(
  eventObject: EventObjectProps,
  categories: Array<{ id: number; name: string }> | undefined,
  { eventImageValid, eventExtraInfoValid }: StepValidityState,
) {
  const [eventTitleValid, setEventTitleValid] = useLatchedValidity(
    isTitleFilledIn(eventObject),
  );
  const [eventAddressValid, setEventAddressValid] = useLatchedValidity(
    isAddressFilledIn(eventObject),
  );
  const [eventDescriptionValid, setEventDescriptionValid] = useLatchedValidity(
    isDescriptionFilledIn(eventObject),
  );
  const [eventActiveCategoriesValid, setEventActiveCategoriesValid] =
    useLatchedValidity(isDescriptionFilledIn(eventObject));

  const dates = deriveDateValidity(eventObject);
  const registration = deriveRegistrationValidity(eventObject);
  const externalRegistrationUrlValid = isExternalUrlValid(eventObject);
  const eventCapacityValid = isCapacityValid(eventObject);

  const dateInputPageValid =
    Object.values(dates).every(Boolean) &&
    Object.values(registration).every(Boolean) &&
    externalRegistrationUrlValid;

  const validEvent = allEventInputsValid([
    eventTitleValid,
    eventDescriptionValid,
    eventAddressValid,
    eventActiveCategoriesValid,
    eventCapacityValid,
    eventImageValid,
    dateInputPageValid,
    eventObject.currentStep === SUMMARY_STEP,
  ]);

  const validDataMap = new Map<InputPages, boolean>([
    [InputPages.TITLE_PAGE, eventTitleValid],
    [InputPages.DATE_PAGE, dateInputPageValid],
    [InputPages.ADDRESS_PAGE, eventAddressValid],
    [
      InputPages.DESCRIPTION_PAGE,
      eventDescriptionValid && eventActiveCategoriesValid,
    ],
    [InputPages.IMAGE_PAGE, eventImageValid],
    [InputPages.EXTRA_INFO_PAGE, eventCapacityValid && eventExtraInfoValid],
    [InputPages.SUMMARY_PAGE, validEvent],
  ]);

  return {
    ...dates,
    ...registration,
    eventTitleValid,
    setEventTitleValid,
    eventAddressValid,
    setEventAddressValid,
    eventDescriptionValid,
    setEventDescriptionValid,
    eventActiveCategoriesValid,
    setEventActiveCategoriesValid,
    eventCapacityValid,
    externalRegistrationUrlValid,
    validEvent,
    validDataMap,
    summaryCategories: eventObject.eventActiveCategories.map((categoryId) => ({
      id: categoryId,
      name: getCategoryText(categories ?? [], categoryId),
    })),
  };
}
