import { useEffect, useId, useRef, useState } from "react";

import type { ArrangerOption } from "../../hooks/useCreateEventForm";
import Avatar from "../Avatar";
import ChevronIcon from "../svgs/ChevronIcon";
import styles from "../../styles/CreateEvent.module.scss";

export interface ArrangerSelectProps {
  options: ArrangerOption[];
  value: string;
  onChange: (arrangerId: string) => void;
  label?: string;
}

/** The avatar and name of one arranger, in the trigger and in the list. */
function ArrangerOptionContent({ option }: { option: ArrangerOption }) {
  return (
    <>
      <span className={styles.arrangerAvatar} aria-hidden="true">
        <Avatar org={option.organization} user={option.user} size="small" />
      </span>
      <span className={styles.arrangerName}>{option.label}</span>
    </>
  );
}

/**
 * Who the event is created as, picked before the title.
 *
 * A native <select> cannot render an image next to an option, and the whole
 * point of asking this first is that you can see at a glance which of your
 * organizations you are about to publish under. So this is a listbox: same
 * single choice, but each row carries the organization's avatar.
 */
export default function ArrangerSelect({
  options,
  value,
  onChange,
  label = "Opprett arrangementet som",
}: ArrangerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setIsOpen(false);
    };
    /* Pointerdown rather than click: the list sits over the sticky CTA bar, so
       waiting for click would fire the button underneath before closing. */
    const closeOnOutside = (ev: PointerEvent) => {
      if (!containerRef.current?.contains(ev.target as Node)) setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutside);
    };
  }, [isOpen]);

  /* A resumed draft carries its arranger id from localStorage, and that id can
     point at an organization the user has since lost access to. The prompt is
     shown rather than a blank trigger, so the choice has to be made again. */
  const selected = options.find((option) => option.value === value);

  if (options.length === 0) return null;

  return (
    <div className={styles.arrangerSelect} ref={containerRef}>
      <div className={styles.arrangerLabelContainer}>
        <span className={styles.arrangerLabel} id={labelId}>
          {label}
        </span>
      </div>
      <button
        type="button"
        className={styles.arrangerTrigger}
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
      >
        {selected ? (
          <ArrangerOptionContent option={selected} />
        ) : (
          <span className={styles.arrangerName}>Velg arrangør</span>
        )}
        <ChevronIcon className={styles.arrangerChevron} />
      </button>
      {isOpen && (
        <div
          className={styles.arrangerOptionList}
          role="listbox"
          aria-labelledby={labelId}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`${styles.arrangerOptionButton} ${
                option.value === value ? styles.arrangerOptionSelected : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <ArrangerOptionContent option={option} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
