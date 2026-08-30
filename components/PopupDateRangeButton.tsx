import { useEffect, useRef, useState } from "react";
import { type DateRange, DayPicker } from "react-day-picker";
import { nb } from "react-day-picker/locale";

import styles from "../styles/PopupScheduler.module.scss";
import type { Popup } from "../types/types";
import { formatPopupRange } from "../utils/popups";
import CalendarIconCard from "./svgs/CalendarIconCard";

export interface PopupInterval {
  startsAt: string;
  endsAt: string;
}

function atTimeOfDay(day: Date, timeOfDay: Date) {
  const moment = new Date(day);
  moment.setHours(timeOfDay.getHours(), timeOfDay.getMinutes(), 0, 0);
  return moment;
}

function theDayAfter(day: Date) {
  const next = new Date(day);
  next.setDate(next.getDate() + 1);
  return next;
}

function scheduledInterval(popup: Popup) {
  const from = new Date(popup.startsAt);
  const to = new Date(popup.endsAt);
  const isReadable =
    !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime());
  return isReadable ? { from, to } : undefined;
}

function intervalFromRange(
  range: DateRange | undefined,
  scheduled: { from: Date; to: Date },
): PopupInterval | undefined {
  if (!range?.from || !range.to) return undefined;

  const startsAt = atTimeOfDay(range.from, scheduled.from);
  const endsOnTheChosenDay = atTimeOfDay(range.to, scheduled.to);
  const endsAt =
    endsOnTheChosenDay > startsAt
      ? endsOnTheChosenDay
      : atTimeOfDay(theDayAfter(range.to), scheduled.to);

  return { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
}

export default function PopupDateRangeButton({
  popup,
  disabled,
  onChange,
}: {
  popup: Popup;
  disabled: boolean;
  onChange: (interval: PopupInterval) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>();
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || saving) return;
    const close = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open, saving]);

  const scheduled = scheduledInterval(popup);

  const togglePicker = () => {
    if (!scheduled) return;
    if (open) {
      setOpen(false);
      return;
    }
    setRange(scheduled);
    setOpen(true);
  };

  const pendingInterval = scheduled && intervalFromRange(range, scheduled);

  const saveInterval = async () => {
    if (!pendingInterval) return;
    setSaving(true);
    const saved = await onChange(pendingInterval).then(
      () => true,
      () => false,
    );
    setSaving(false);
    if (saved) setOpen(false);
  };

  return (
    <div ref={containerRef}>
      <button
        type="button"
        className={styles.rangeToggle}
        onClick={togglePicker}
        disabled={disabled || saving || !scheduled}
        aria-expanded={open}
        aria-label="Endre datoer"
      >
        <CalendarIconCard />
      </button>
      {open && (
        <div className={styles.calendarPopover}>
          <DayPicker
            className={styles.dayPicker}
            mode="range"
            locale={nb}
            defaultMonth={scheduled?.from}
            disabled={saving}
            selected={range}
            onSelect={(nextRange) => setRange(nextRange)}
            resetOnSelect
          />
          <div className={styles.calendarFooter}>
            <span className={styles.pendingRange}>
              {pendingInterval
                ? formatPopupRange(
                    pendingInterval.startsAt,
                    pendingInterval.endsAt,
                  )
                : "Velg sluttdato"}
            </span>
            <button
              type="button"
              className={styles.saveRange}
              onClick={saveInterval}
              disabled={!pendingInterval || saving}
            >
              {saving ? "Lagrer …" : "Lagre datoer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
