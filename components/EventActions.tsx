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
  /** Icon-only calendar button, for cards too narrow for its label. */
  calendarButtonIconOnly?: boolean;
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
  calendarButtonIconOnly,
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
    <AddToCalendarButton
      event={event}
      buttonText={calendarButtonText}
      iconOnly={calendarButtonIconOnly}
      size={ButtonSize.COMPACT}
      className={calendarButtonClassName}
    />
  </>
);

export default EventActions;
