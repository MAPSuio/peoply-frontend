import type { ReactNode } from "react";

import type { Event } from "../types/types";
import { showsRegistrationCount } from "../utils/event";

interface RegistrationCountProps {
  event: Pick<Event, "registrationMode">;
  /* The whole count row - icon included. Each surface styles its own, but
     none of them may render without passing through this gate. */
  children: ReactNode;
}

/**
 * Renders an attendee count only for events that have one to show.
 *
 * Events registered for on another site are not signed up for in Peoply, so
 * the registrations we hold are leftovers rather than the turnout. Hiding the
 * number alone left the icon behind on the event page, which read as a
 * rendering fault, so callers hand over the entire row and get nothing back
 * when there is nothing to say.
 */
const RegistrationCount = ({
  event,
  children,
}: RegistrationCountProps): ReactNode =>
  showsRegistrationCount(event) ? children : null;

export default RegistrationCount;
