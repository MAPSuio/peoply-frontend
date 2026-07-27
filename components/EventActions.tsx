import AddToCalendarButton from "./AddToCalendarButton";
import JoinButton from "./JoinButton";
import { ButtonSize, type Event } from "../types/types";

interface EventActionsProps {
  event: Event;
  /* SWR mutators to revalidate after the registration changes. They carry
     different (and irrelevant, here) Data types, and are only ever called
     with no arguments to trigger a revalidation - see JoinButton's runUpdate. */
  updateOnChange?: Array<() => unknown>;
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
      size={ButtonSize.COMPACT}
      noShadow
      className={joinButtonClassName}
    />
    {/* Width comes from the card's className, so narrow screens can shrink
        the button to icon-only - an inline width would win over that. */}
    <AddToCalendarButton
      event={event}
      buttonText={calendarButtonText}
      size={ButtonSize.COMPACT}
      className={calendarButtonClassName}
    />
  </>
);

export default EventActions;
