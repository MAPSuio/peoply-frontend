import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { ImageCaching, type User } from "../../types/types";
import {
  type EventObjectProps,
  clearStoredDraft,
  draftWithFieldsOlderBuildsOmitted,
  hasStoredDraft,
  readStoredDraft,
} from "./eventDraft";
import type { EventDraft } from "./useEventDraft";

const IMAGE_STEP = 4;

export interface StepValiditySetters {
  setEventImageValid: Dispatch<SetStateAction<boolean>>;
  setEventExtraInfoValid: Dispatch<SetStateAction<boolean>>;
}

export default function useDraftRestore(
  { replaceEvent }: EventDraft,
  restoreImage: (draft: EventObjectProps) => void,
  user: User | undefined,
  { setEventImageValid, setEventExtraInfoValid }: StepValiditySetters,
) {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setModalOpen(hasStoredDraft());
  }, []);

  const startNewEventCreation = () => clearStoredDraft();

  const continueEventCreation = () => {
    const stored = readStoredDraft();
    if (!stored) {
      startNewEventCreation();
      return;
    }

    const draft = draftWithFieldsOlderBuildsOmitted(stored, user?.arrangerId);
    setEventExtraInfoValid(draft.eventExtraInfoValid);

    if (draft.imageCached === ImageCaching.PREEMPTIVE_MESSAGE) {
      setEventImageValid(false);
      replaceEvent({
        ...draft,
        eventImage: undefined,
        imageCached: ImageCaching.REFRESH_MESSAGE,
        eventImageValid: false,
        currentStep: IMAGE_STEP,
      });
      return;
    }

    restoreImage(draft);
    setEventImageValid(draft.eventImageValid);
  };

  return {
    modalOpen,
    setModalOpen,
    startNewEventCreation,
    continueEventCreation,
  };
}
