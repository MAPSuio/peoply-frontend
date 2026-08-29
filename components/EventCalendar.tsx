import FullCalendar, {
  type DayCellInfo,
  type EventClickInfo,
  type EventDisplayInfo,
  type MountInfo,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import listPlugin from "@fullcalendar/react/list";
import nbLocale from "@fullcalendar/react/locales/nb";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import useEventPreview from "../hooks/useEventPreview";
import styles from "../styles/CalendarPage.module.scss";
import type { Event } from "../types/types";
import {
  arrangerAccentVariable,
  arrangerBackgroundVariable,
} from "../utils/arrangerColor";
import {
  boundedNavigationRange,
  toArrangerColorsByKey,
  toCalendarEvents,
} from "../utils/calendarEvents";
import { toArrangerColorVariables } from "../utils/arrangerColorVariables";
import EventPreviewCard, { EVENT_PREVIEW_ID } from "./EventPreviewCard";

export interface EventCalendarProps {
  events: Event[];
}

// Rendered client-side only (next/dynamic with ssr: false), so window is
// always available here.
const DESKTOP_QUERY = "(min-width: 600px)";

const ARRANGER_ICON_SIZE_PX = 24;

const MAX_EVENTS_PER_DAY_CELL = 3;

function paintWithArrangerColors(element: HTMLElement, paletteKey: string) {
  element.style.setProperty(
    "--calendar-event-background",
    `var(${arrangerBackgroundVariable(paletteKey)})`,
  );
  element.style.setProperty(
    "--calendar-event-accent",
    `var(${arrangerAccentVariable(paletteKey)})`,
  );
}

function getDayCellClass(info: DayCellInfo) {
  return [
    styles.dayCell,
    info.isToday && styles.dayCellToday,
    (info.isOther || info.isDisabled) && styles.dayCellMuted,
  ]
    .filter(Boolean)
    .join(" ");
}

const CALENDAR_CHROME = {
  plugins: [classicThemePlugin, dayGridPlugin, listPlugin],
  locale: nbLocale,
  headerToolbar: {
    left: "prev,next",
    center: "title",
    right: "dayGridMonth,listUpcoming",
  },
  buttons: { listUpcoming: { text: "Agenda" } },
  headerToolbarClass: styles.calendarToolbar,
  toolbarTitleClass: styles.calendarToolbarTitle,
  buttonClass: (info: { isSelected: boolean }) =>
    [styles.calendarButton, info.isSelected && styles.calendarButtonActive]
      .filter(Boolean)
      .join(" "),
  dayCellTopInnerClass: styles.dayNumber,
  dayCellBottomClass: styles.dayCellBottom,
  moreLinkClass: styles.moreLink,
  moreLinkInnerClass: styles.moreLinkInner,
  popoverClass: styles.calendarPopover,
  dayHeaderClass: (info: { inPopover: boolean }) =>
    info.inPopover ? styles.calendarPopoverHeader : undefined,
  dayHeaderInnerClass: (info: { inPopover: boolean }) =>
    info.inPopover ? styles.calendarPopoverTitle : styles.dayHeader,
  dayCellClass: (info: DayCellInfo & { inPopover: boolean }) =>
    info.inPopover ? styles.calendarPopoverBody : getDayCellClass(info),
  listDayHeaderInnerClass: styles.listDayHeader,
  noEventsClass: styles.noEvents,
  noEventsInnerClass: styles.noEventsInner,
  views: {
    // Agenda spanning three months so the landing view always has
    // upcoming events in it, even late in the current month.
    listUpcoming: {
      type: "list" as const,
      duration: { months: 3 },
      className: styles.listView,
      listItemEventClass: styles.listCalendarEvent,
      listItemEventBeforeClass: styles.hiddenListDot,
      listItemEventTimeClass: styles.listEventTime,
    },
    dayGrid: {
      className: styles.monthView,
      eventClass: styles.gridCalendarEvent,
    },
  },
  dayMaxEvents: MAX_EVENTS_PER_DAY_CELL,
  height: "auto",
  tableHeaderSticky: false,
  eventTimeFormat: {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  } as const,
  eventDisplay: "block" as const,
  noEventsContent: "Ingen kommende arrangementer i denne perioden.",
};

function ArrangerIcon({
  className,
  imageUrl,
  initial,
}: {
  className: string;
  imageUrl?: string;
  initial: string;
}) {
  return (
    <span aria-hidden="true" className={className}>
      {imageUrl ? (
        <Image
          alt=""
          className={styles.listEventIconImage}
          height={ARRANGER_ICON_SIZE_PX}
          src={imageUrl}
          width={ARRANGER_ICON_SIZE_PX}
        />
      ) : (
        <span className={styles.listEventIconInitial}>{initial}</span>
      )}
    </span>
  );
}

function renderEventContent(arg: EventDisplayInfo) {
  if (arg.view.type === "listUpcoming") {
    // The list view expects an anchor inside the row when the event has a
    // url - replacing the default content without one breaks FullCalendar's
    // click handling.
    return (
      <a href={arg.event.url} className={styles.listEvent}>
        <ArrangerIcon
          className={styles.listEventIcon}
          imageUrl={arg.event.extendedProps.arrangerImageUrl}
          initial={arg.event.extendedProps.arrangerInitial}
        />
        <span className={styles.listEventText}>
          {arg.timeText ? (
            <span className={styles.listEventTime}>{arg.timeText}</span>
          ) : undefined}
          <span className={styles.listEventTitle}>{arg.event.title}</span>
          {arg.event.extendedProps.arranger ? (
            <span className={styles.listEventArranger}>
              {arg.event.extendedProps.arranger}
            </span>
          ) : undefined}
        </span>
      </a>
    );
  }

  return (
    <div className={styles.gridEvent}>
      <ArrangerIcon
        className={styles.gridEventIcon}
        imageUrl={arg.event.extendedProps.arrangerImageUrl}
        initial={arg.event.extendedProps.arrangerInitial}
      />
      <span className={styles.gridEventTime}>
        {arg.timeText || arg.event.extendedProps.startTime}
      </span>
      <span className={styles.gridEventTitle}>{arg.event.title}</span>
    </div>
  );
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const router = useRouter();
  const { preview, showFor, cancelClose, scheduleClose } = useEventPreview();
  const [initialView] = useState(() =>
    window.matchMedia(DESKTOP_QUERY).matches ? "dayGridMonth" : "listUpcoming",
  );

  const validRange = useMemo(() => boundedNavigationRange(new Date()), []);

  const calendarEvents = useMemo(() => toCalendarEvents(events), [events]);
  const arrangerColorVariables = useMemo(
    () => toArrangerColorVariables(toArrangerColorsByKey(calendarEvents)),
    [calendarEvents],
  );

  const showPreviewFor = (info: {
    el: HTMLElement;
    event: { extendedProps: { sourceEvent?: Event } };
  }) => {
    const { sourceEvent } = info.event.extendedProps;
    if (sourceEvent) showFor(info.el, sourceEvent);
  };

  const handleEventClick = (info: EventClickInfo) => {
    info.jsEvent.preventDefault();
    if (info.event.url) {
      router.push(info.event.url);
    }
  };

  const handleEventDidMount = (info: MountInfo<EventDisplayInfo>) => {
    paintWithArrangerColors(info.el, info.event.extendedProps.paletteKey);
    info.el.addEventListener("focusin", () => showPreviewFor(info));
    info.el.addEventListener("focusout", scheduleClose);
    info.el.setAttribute("aria-describedby", EVENT_PREVIEW_ID);
  };

  return (
    <div className={styles.calendar} style={arrangerColorVariables}>
      <FullCalendar
        {...CALENDAR_CHROME}
        initialView={initialView}
        events={calendarEvents}
        eventContent={renderEventContent}
        eventClick={handleEventClick}
        eventMouseEnter={showPreviewFor}
        eventMouseLeave={scheduleClose}
        eventDidMount={handleEventDidMount}
        validRange={validRange}
      />
      {preview ? (
        <EventPreviewCard
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          preview={preview}
        />
      ) : null}
    </div>
  );
}
