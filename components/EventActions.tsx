import useSWR from "swr";
import useUser from "../hooks/useUser";
import { eventHasSelfRegistration } from "../utils/event";
import AddToCalendarButton from "./AddToCalendarButton";
import JoinButton from "./JoinButton";
import {
  ButtonSize,
  type Event,
  type Registration,
  RegStatus,
} from "../types/types";

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
 * The action row on event cards.
 *
 * Joining is the primary action, so before the user is registered it is the
 * only button - full width, one obvious tap target. "Legg i kalender" is a
 * follow-up to joining and only appears once the registration is confirmed.
 * Events without in-app registration have nothing to join, so they show the
 * calendar button alone instead.
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
}: EventActionsProps) => {
  const { user } = useUser();

  /* Same key as JoinButton's registration fetch, so SWR dedupes the request
     and this re-renders the moment a join succeeds over there. */
  const { data: myRegistration } = useSWR<Registration>(() =>
    user?.id && event.id
      ? `/users/${user.id}/registrations/${event.id}`
      : false,
  );

  const showCalendarButton =
    !eventHasSelfRegistration(event) ||
    myRegistration?.regStatus === RegStatus.GOING;

  return (
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
      {showCalendarButton && (
        <AddToCalendarButton
          event={event}
          buttonText={calendarButtonText}
          size={ButtonSize.COMPACT}
          className={calendarButtonClassName}
        />
      )}
    </>
  );
};

export default EventActions;
