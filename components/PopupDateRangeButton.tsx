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

function atTimeOfDay(day: Date, timestamp: string) {
  const timeOfDay = new Date(timestamp);
  const moment = new Date(day);
  moment.setHours(timeOfDay.getHours(), timeOfDay.getMinutes(), 0, 0);
  return moment.toISOString();
}

function intervalFromRange(
  range: DateRange | undefined,
  popup: Popup,
): PopupInterval | undefined {
  if (!range?.from || !range.to) return undefined;
  return {
    startsAt: atTimeOfDay(range.from, popup.startsAt),
    endsAt: atTimeOfDay(range.to, popup.endsAt),
  };
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
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const togglePicker = () => {
    setRange({ from: new Date(popup.startsAt), to: new Date(popup.endsAt) });
    setOpen((wasOpen) => !wasOpen);
  };

  const pendingInterval = intervalFromRange(range, popup);

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
        onClick={togglePicker}
        disabled={disabled}
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
            defaultMonth={new Date(popup.startsAt)}
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
