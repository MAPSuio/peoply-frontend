import { KeyedMutator } from "swr";

import AddToCalendarButton from "./AddToCalendarButton";
import JoinButton from "./JoinButton";
import { Event } from "../types/types";

interface EventActionsProps {
  event: Event;
  /* SWR mutators to revalidate after the registration changes. */
  updateOnChange?: KeyedMutator<any>[];
  useUnregisterModal?: boolean;
  calendarButtonText?: string;
  joinButtonClassName?: string;
  calendarButtonClassName?: string;
}

/**
 * Join + add-to-calendar pair.
 *
 * The eight labels below were repeated verbatim at every call site, so a
 * wording change meant editing the same Norwegian strings in several files and
 * hoping none were missed.
 */
const EventActions = ({
  event,
  updateOnChange,
  useUnregisterModal,
  calendarButtonText,
  joinButtonClassName,
  calendarButtonClassName,
}: EventActionsProps) => (
  <>
    <JoinButton
      event={event}
      countdownText="Åpner om"
      updateOnChange={updateOnChange}
      joinText="Meld på"
      joinedText="Påmeldt"
      joinWaitlistText="Venteliste"
      joinedWaitlistText="Du står i kø"
      eventFinishedText="Arrangementet er ferdig"
      regClosedText="Påmelding er stengt"
      useUnregisterModal={useUnregisterModal}
      small
      noShadow
      className={joinButtonClassName}
    />
    <AddToCalendarButton
      event={event}
      buttonText={calendarButtonText}
      width="100%"
      className={calendarButtonClassName}
    />
  </>
);

export default EventActions;
