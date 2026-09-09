import { useEffect, useRef, useState } from "react";

import type { User } from "../../types/types";
import {
  type EventObjectProps,
  emptyEventDraft,
  writeStoredDraft,
} from "./eventDraft";

export interface EventDraft {
  eventObject: EventObjectProps;
  patchEvent: (patch: Partial<EventObjectProps>) => void;
  patchEventFrom: (
    derive: (current: EventObjectProps) => Partial<EventObjectProps>,
  ) => void;
  replaceEvent: (draft: EventObjectProps) => void;
  patchEventWithoutStoring: (patch: Partial<EventObjectProps>) => void;
}

export default function useEventDraft(
  user: User | undefined,
  stepValidity: { eventExtraInfoValid: boolean; eventImageValid: boolean },
): EventDraft {
  const [eventObject, setEventObject] = useState<EventObjectProps>(() =>
    emptyEventDraft(user?.arrangerId ?? ""),
  );
  const latestEventObject = useRef(eventObject);
  const latestStepValidity = useRef(stepValidity);

  useEffect(() => {
    latestEventObject.current = eventObject;
  }, [eventObject]);

  useEffect(() => {
    latestStepValidity.current = stepValidity;
  }, [stepValidity]);

  const writeEvent = (nextEventObject: EventObjectProps) => {
    latestEventObject.current = nextEventObject;
    setEventObject(nextEventObject);
    writeStoredDraft({ ...nextEventObject, ...latestStepValidity.current });
  };

  const patchEvent = (patch: Partial<EventObjectProps>) =>
    writeEvent({ ...latestEventObject.current, ...patch });

  const patchEventFrom = (
    derive: (current: EventObjectProps) => Partial<EventObjectProps>,
  ) =>
    writeEvent({
      ...latestEventObject.current,
      ...derive(latestEventObject.current),
    });

  const replaceEvent = (draft: EventObjectProps) => {
    latestEventObject.current = draft;
    setEventObject(draft);
  };

  const patchEventWithoutStoring = (patch: Partial<EventObjectProps>) =>
    replaceEvent({ ...latestEventObject.current, ...patch });

  useEffect(() => {
    const arrangerId = user?.arrangerId;
    if (!arrangerId) {
      return;
    }
    setEventObject((previous) =>
      previous.eventArrangerId === ""
        ? { ...previous, eventArrangerId: arrangerId }
        : previous,
    );
  }, [user?.arrangerId]);

  return {
    eventObject,
    patchEvent,
    patchEventFrom,
    replaceEvent,
    patchEventWithoutStoring,
  };
}
