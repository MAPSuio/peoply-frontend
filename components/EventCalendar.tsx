import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import nbLocale from "@fullcalendar/core/locales/nb";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import styles from "../styles/CalendarPage.module.scss";
import type { Event } from "../types/types";
import { getArrangerColor } from "../utils/arrangerColor";
import {
  getCompactEventArrangerLabel,
  getPrimaryEventArrangerColorKey,
} from "../utils/eventArrangers";

interface EventCalendarProps {
  events: Event[];
}

// Rendered client-side only (next/dynamic with ssr: false), so window is
// always available here.
const DESKTOP_QUERY = "(min-width: 600px)";

function renderEventContent(arg: EventContentArg) {
  if (arg.view.type === "listUpcoming") {
    // The list view expects an anchor inside the row when the event has a
    // url - replacing the default content without one breaks FullCalendar's
    // click handling.
    return (
      <a href={arg.event.url} className={styles.listEvent}>
        <span className={styles.listEventTitle}>{arg.event.title}</span>
        {arg.event.extendedProps.arranger ? (
          <span className={styles.listEventArranger}>
            {arg.event.extendedProps.arranger}
          </span>
        ) : undefined}
      </a>
    );
  }

  return (
    <div className={styles.gridEvent}>
      {arg.timeText ? (
        <span className={styles.gridEventTime}>{arg.timeText}</span>
      ) : undefined}
      <span className={styles.gridEventTitle}>{arg.event.title}</span>
    </div>
  );
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const router = useRouter();
  const [initialView] = useState(() =>
    window.matchMedia(DESKTOP_QUERY).matches ? "dayGridMonth" : "listUpcoming",
  );

  // Bound navigation to the current month through one year ahead. The range
  // starts at the beginning of the month (not today) so the current month
  // renders as a full grid - FullCalendar draws out-of-range days as empty
  // cells without day numbers.
  const validRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear() + 1, now.getMonth() + 1, 1);
    return { start, end };
  }, []);

  const calendarEvents = useMemo(
    () =>
      events.map((event) => {
        const color = getArrangerColor(getPrimaryEventArrangerColorKey(event));
        return {
          id: event.id,
          title: event.title,
          start: new Date(event.startDate),
          end: event.endDate ? new Date(event.endDate) : undefined,
          url: `/events/${event.urlId}`,
          // backgroundColor tints the month-grid chip; borderColor drives the
          // chip's left accent bar and the list view's event dot (see
          // CalendarPage.module.scss).
          backgroundColor: color.background,
          borderColor: color.accent,
          extendedProps: {
            arranger: getCompactEventArrangerLabel(event, 1),
          },
        };
      }),
    [events],
  );

  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    if (info.event.url) {
      router.push(info.event.url);
    }
  };

  return (
    <div className={styles.calendar}>
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin]}
        initialView={initialView}
        locale={nbLocale}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,listUpcoming",
        }}
        views={{
          // Agenda spanning three months so the landing view always has
          // upcoming events in it, even late in the current month.
          listUpcoming: {
            type: "list",
            duration: { months: 3 },
            buttonText: "Agenda",
          },
        }}
        events={calendarEvents}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        validRange={validRange}
        dayMaxEvents={3}
        height="auto"
        stickyHeaderDates={false}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        eventDisplay="block"
        noEventsContent="Ingen kommende arrangementer i denne perioden."
      />
    </div>
  );
}
