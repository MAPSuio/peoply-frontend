import type { ChangeEvent } from "react";

import type { LocationSearchResult } from "../../types/locationSearch";
import { type Organization, Visibility } from "../../types/types";
import type { EventObjectProps } from "../../types/types";
import { toggled } from "./eventDraft";
import type { EventDraft } from "./useEventDraft";

type FieldsOfType<Value> = Extract<
  {
    [Key in keyof EventObjectProps]-?: NonNullable<
      EventObjectProps[Key]
    > extends Value
      ? Key
      : never;
  }[keyof EventObjectProps],
  string
>;

type EventTextField = FieldsOfType<string>;

type EventFlagField = FieldsOfType<boolean>;

const AFFIRMATIVE_CHOICE = 2;

export default function useEventFieldHandlers(
  { patchEvent, patchEventFrom }: EventDraft,
  organizations: Organization[] | undefined,
) {
  const updateEventText =
    <Field extends EventTextField>(field: Field) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      patchEvent({ [field]: e.target.value } as Pick<EventObjectProps, Field>);

  const updateEventFlag =
    <Field extends EventFlagField>(field: Field) =>
    (value: boolean) =>
      patchEvent({ [field]: value } as Pick<EventObjectProps, Field>);

  const updateEventArrangerId = (arrangerId: string) => {
    const primaryOrganizationId = organizations?.find(
      (organization) => organization.arrangerId === arrangerId,
    )?.id;

    patchEventFrom((current) => ({
      eventArrangerId: arrangerId,
      eventCoOrganizerOrganizationIds:
        current.eventCoOrganizerOrganizationIds.filter(
          (organizationId) => organizationId !== primaryOrganizationId,
        ),
    }));
  };

  const toggleCoOrganizerOrganization = (organizationId: string) =>
    patchEventFrom((current) => ({
      eventCoOrganizerOrganizationIds: toggled(
        current.eventCoOrganizerOrganizationIds,
        organizationId,
      ),
    }));

  const updateEventCategories = (categoryId: number) =>
    patchEventFrom((current) => ({
      eventActiveCategories: toggled(current.eventActiveCategories, categoryId),
    }));

  const setEventHasExternalRegistration = (value: boolean) =>
    patchEvent(
      value
        ? { eventHasExternalRegistration: true }
        : { eventHasExternalRegistration: false, eventExternalUrl: "" },
    );

  const setEventHasFormQuestion = (value: boolean) =>
    patchEvent(
      value
        ? { eventHasFormQuestion: true }
        : { eventHasFormQuestion: false, eventFormQuestion: "" },
    );

  return {
    updateEventTitle: updateEventText("eventTitle"),
    updateEventDescription: updateEventText("eventDescription"),
    updateEventLocationName: updateEventText("eventLocationName"),
    updateEventDateStart: updateEventText("eventDateStart"),
    updateEventTimeStart: updateEventText("eventTimeStart"),
    updateEventDateEnd: updateEventText("eventDateEnd"),
    updateEventTimeEnd: updateEventText("eventTimeEnd"),
    updateEventRegStartDate: updateEventText("eventRegStartDate"),
    updateEventRegStartTime: updateEventText("eventRegStartTime"),
    updateEventRegEndDate: updateEventText("eventRegEndDate"),
    updateEventRegEndTime: updateEventText("eventRegEndTime"),
    updateEventCapacity: updateEventText("eventCapacity"),
    updateEventExternalUrl: updateEventText("eventExternalUrl"),
    updateEventFormQuestion: updateEventText("eventFormQuestion"),
    setEventHasDateEnd: updateEventFlag("eventHasDateEnd"),
    seteventHasRegStart: updateEventFlag("eventHasRegStart"),
    seteventHasRegEnd: updateEventFlag("eventHasRegEnd"),
    updateEventLocation: (eventLocation?: LocationSearchResult) =>
      patchEvent({ eventLocation }),
    updateHasCapacity: (choice: number) =>
      patchEvent({ eventHasCapacity: choice === AFFIRMATIVE_CHOICE }),
    updateHasFood: (choice: number) =>
      patchEvent({ eventHasFood: choice === AFFIRMATIVE_CHOICE }),
    updateVisibility: (choice: number) =>
      patchEvent({
        eventVisibility:
          choice === AFFIRMATIVE_CHOICE
            ? Visibility.UNLISTED
            : Visibility.PUBLIC,
      }),
    updateEventArrangerId,
    toggleCoOrganizerOrganization,
    updateEventCategories,
    setEventHasExternalRegistration,
    setEventHasFormQuestion,
  };
}
