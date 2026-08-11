import FullCalendar, {
  type DayCellInfo,
  type EventClickInfo,
  type EventDisplayInfo,
  type EventHoveringInfo,
  type MountInfo,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import listPlugin from "@fullcalendar/react/list";
import nbLocale from "@fullcalendar/react/locales/nb";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";

import styles from "../styles/CalendarPage.module.scss";
import type { Event } from "../types/types";
import { getArrangerColor } from "../utils/arrangerColor";
import { formatDateRange, formatTimeRange } from "../utils/functions";
import {
  getCompactEventArrangerLabel,
  getPrimaryEventArrangerColorKey,
} from "../utils/eventArrangers";

interface EventCalendarProps {
  events: Event[];
}

interface EventPreview {
  event: Event;
  position: { left: number; top: number };
}

// Rendered client-side only (next/dynamic with ssr: false), so window is
// always available here.
const DESKTOP_QUERY = "(min-width: 600px)";

function renderEventContent(arg: EventDisplayInfo) {
  if (arg.view.type === "listUpcoming") {
    // The list view expects an anchor inside the row when the event has a
    // url - replacing the default content without one breaks FullCalendar's
    // click handling.
    return (
      <a href={arg.event.url} className={styles.listEvent}>
        {arg.timeText ? (
          <span className={styles.listEventTime}>{arg.timeText}</span>
        ) : undefined}
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
  const closePreviewTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [eventPreview, setEventPreview] = useState<EventPreview>();
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
          color: color.accent,
          extendedProps: {
            arranger: getCompactEventArrangerLabel(event, 1),
            backgroundColor: color.background,
            sourceEvent: event,
          },
        };
      }),
    [events],
  );

  const handleEventClick = (info: EventClickInfo) => {
    info.jsEvent.preventDefault();
    if (info.event.url) {
      router.push(info.event.url);
    }
  };

  const cancelPreviewClose = () => {
    if (closePreviewTimeout.current) {
      clearTimeout(closePreviewTimeout.current);
      closePreviewTimeout.current = undefined;
    }
  };

  // This delay bridges the space between FullCalendar's event and the preview.
  const schedulePreviewClose = () => {
    cancelPreviewClose();
    closePreviewTimeout.current = setTimeout(() => {
      setEventPreview(undefined);
    }, 150);
  };

  const showPreview = (
    info: EventHoveringInfo | MountInfo<EventDisplayInfo>,
  ) => {
    cancelPreviewClose();
    const event = info.event.extendedProps.sourceEvent as Event | undefined;
    if (!event) return;

    const rect = info.el.getBoundingClientRect();
    setEventPreview({
      event,
      position: { left: rect.left, top: rect.bottom + 8 },
    });
  };

  const handleEventDidMount = (info: MountInfo<EventDisplayInfo>) => {
    info.el.style.setProperty(
      "--calendar-event-background",
      info.event.extendedProps.backgroundColor,
    );
    info.el.style.setProperty("--calendar-event-accent", info.color);
    info.el.addEventListener("focusin", () => showPreview(info));
    info.el.addEventListener("focusout", schedulePreviewClose);
    info.el.setAttribute("aria-describedby", "calendar-event-preview");
  };

  const handlePreviewMount = (element: HTMLElement | null) => {
    if (!element) return;
    element.addEventListener("mouseenter", cancelPreviewClose);
    element.addEventListener("mouseleave", schedulePreviewClose);
  };

  const getDayCellClass = (info: DayCellInfo) =>
    [
      styles.dayCell,
      info.isToday && styles.dayCellToday,
      (info.isOther || info.isDisabled) && styles.dayCellMuted,
    ]
      .filter(Boolean)
      .join(" ");

  const renderEventPreview = () => {
    if (!eventPreview) return null;

    const { event, position } = eventPreview;
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    const arranger = getCompactEventArrangerLabel(event, 2);

    return (
      <aside
        aria-live="polite"
        className={styles.eventPreview}
        id="calendar-event-preview"
        ref={handlePreviewMount}
        role="tooltip"
        style={position}
      >
        <p className={styles.eventPreviewDate}>
          {formatDateRange(startDate, endDate)} ·{" "}
          {formatTimeRange(startDate, endDate)}
        </p>
        <h2 className={styles.eventPreviewTitle}>{event.title}</h2>
        {arranger ? (
          <p className={styles.eventPreviewMeta}>{arranger}</p>
        ) : null}
        {event.locationName ? (
          <p className={styles.eventPreviewMeta}>{event.locationName}</p>
        ) : null}
        {event.description ? (
          <p className={styles.eventPreviewDescription}>{event.description}</p>
        ) : null}
      </aside>
    );
  };

  return (
    <div className={styles.calendar}>
      <FullCalendar
        plugins={[classicThemePlugin, dayGridPlugin, listPlugin]}
        initialView={initialView}
        locale={nbLocale}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,listUpcoming",
        }}
        buttons={{
          listUpcoming: { text: "Agenda" },
        }}
        headerToolbarClass={styles.calendarToolbar}
        toolbarTitleClass={styles.calendarToolbarTitle}
        buttonClass={(info) =>
          [
            styles.calendarButton,
            info.isSelected && styles.calendarButtonActive,
          ]
            .filter(Boolean)
            .join(" ")
        }
        dayCellTopInnerClass={styles.dayNumber}
        dayCellBottomClass={styles.dayCellBottom}
        moreLinkClass={styles.moreLink}
        moreLinkInnerClass={styles.moreLinkInner}
        popoverClass={styles.calendarPopover}
        dayHeaderClass={(info) =>
          info.inPopover ? styles.calendarPopoverHeader : undefined
        }
        dayHeaderInnerClass={(info) =>
          info.inPopover ? styles.calendarPopoverTitle : styles.dayHeader
        }
        dayCellClass={(info) =>
          info.inPopover ? styles.calendarPopoverBody : getDayCellClass(info)
        }
        listDayHeaderInnerClass={styles.listDayHeader}
        noEventsClass={styles.noEvents}
        noEventsInnerClass={styles.noEventsInner}
        views={{
          // Agenda spanning three months so the landing view always has
          // upcoming events in it, even late in the current month.
          listUpcoming: {
            type: "list",
            duration: { months: 3 },
            className: styles.listView,
            listItemEventClass: styles.listCalendarEvent,
            listItemEventBeforeClass: styles.listEventDot,
            listItemEventTimeClass: styles.listEventTime,
          },
          dayGrid: {
            eventClass: styles.gridCalendarEvent,
          },
        }}
        events={calendarEvents}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        eventMouseEnter={showPreview}
        eventMouseLeave={schedulePreviewClose}
        eventDidMount={handleEventDidMount}
        validRange={validRange}
        dayMaxEvents={3}
        height="auto"
        tableHeaderSticky={false}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        eventDisplay="block"
        noEventsContent="Ingen kommende arrangementer i denne perioden."
      />
      {renderEventPreview()}
    </div>
  );
}
