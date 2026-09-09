import { useState } from "react";
import useSWR from "swr";

import { fetchAllFromPeoplyApiJson } from "../services/fetchers";
import type { Organization } from "../types/types";
import { arrangerOptionsFor } from "./createEvent/arrangerOptions";
import { STEP_COUNT } from "./createEvent/eventDraft";
import useCoOrganizerPicker from "./createEvent/useCoOrganizerPicker";
import useDraftRestore from "./createEvent/useDraftRestore";
import useEventDraft from "./createEvent/useEventDraft";
import useEventFieldHandlers from "./createEvent/useEventFieldHandlers";
import useEventImage from "./createEvent/useEventImage";
import useEventSubmit from "./createEvent/useEventSubmit";
import useStepValidity from "./createEvent/useStepValidity";
import useUser from "./useUser";

export type {
  ArrangerOption,
  EventObjectProps,
} from "./createEvent/eventDraft";

export default function useCreateEventForm() {
  const { user, ipInfo, orgs } = useUser();
  const [eventExtraInfoValid, setEventExtraInfoValid] = useState(false);
  const [eventImageValid, setEventImageValid] = useState(false);

  const { data: categories } = useSWR("/categories");
  const { data: organizations } = useSWR<Organization[]>(
    "/organizations?orderBy=name",
    fetchAllFromPeoplyApiJson,
  );

  const draft = useEventDraft(user, { eventExtraInfoValid, eventImageValid });
  const { eventObject } = draft;

  const { updateEventImage, restoreImage } = useEventImage(draft);
  const handlers = useEventFieldHandlers(draft, orgs);
  const { summaryPageOnClick } = useEventSubmit(user);

  const validity = useStepValidity(eventObject, categories, {
    eventImageValid,
    setEventImageValid,
    eventExtraInfoValid,
    setEventExtraInfoValid,
  });

  const coOrganizers = useCoOrganizerPicker(
    organizations,
    orgs?.find(
      (organization) => organization.arrangerId === eventObject.eventArrangerId,
    )?.id,
    eventObject.eventCoOrganizerOrganizationIds,
  );

  const restore = useDraftRestore(draft, restoreImage, user, {
    setEventImageValid,
    setEventExtraInfoValid,
  });

  const inputPageOnClick = (step: number) =>
    draft.patchEventFrom((current) => ({
      currentStep: step === STEP_COUNT ? current.currentStep : step,
      reachedStep: Math.max(current.reachedStep, step),
    }));

  return {
    ...handlers,
    ...validity,
    ...coOrganizers,
    ...restore,
    ipInfo,
    categories,
    eventObject,
    stepCount: STEP_COUNT,
    validArrangersOptions: arrangerOptionsFor(user, orgs),
    updateEventImage,
    inputPageOnClick,
    summaryPageOnClick,
    eventImageValid,
    setEventImageValid,
    eventExtraInfoValid,
    setEventExtraInfoValid,
  };
}
