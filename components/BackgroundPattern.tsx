import { useEffect, useState } from "react";

import {
  BACKGROUND_PATTERN_EVENT,
  getBackgroundPatternEnabled,
} from "../utils/backgroundPattern";

import styles from "../styles/App.module.scss";

const rows = [
  "oo o oo  ooo o  oo ooo",
  "o  oo o  oo  ooo oo  o",
  "ooo o  oo o oo  o  oo",
  "oo  ooo oo  o  oo o oo",
  "o oo  o  ooo oo  oo  o",
  "oo  o oo  oo  ooo o  oo",
  "o  ooo o oo  o  oo ooo",
  "ooo  oo o  ooo  o oo  o",
  "oo o  oo  o oo  ooo  oo",
];

const START_X = 2.5;
const STEP_X = 4.2;
const START_Y = 16;
const STEP_Y = 13;

/* The decorative dot field behind the page. Opt-in: it renders nothing until
   the user turns it on under Innstillinger. */
export default function BackgroundPattern() {
  const [enabled, setEnabled] = useState(() => getBackgroundPatternEnabled());

  useEffect(() => {
    const readPreference = () => setEnabled(getBackgroundPatternEnabled());

    const handlePreferenceChange = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "boolean") {
        setEnabled(event.detail);
        return;
      }

      readPreference();
    };

    /* The server rendered `false`, so a user who has it on needs the client to
       catch up on mount. */
    readPreference();
    window.addEventListener(BACKGROUND_PATTERN_EVENT, handlePreferenceChange);
    window.addEventListener("storage", readPreference);

    return () => {
      window.removeEventListener(
        BACKGROUND_PATTERN_EVENT,
        handlePreferenceChange,
      );
      window.removeEventListener("storage", readPreference);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className={styles.background}
      aria-hidden="true"
      data-testid="background-pattern"
    >
      <svg
        className={styles.backgroundPattern}
        aria-hidden="true"
        viewBox="0 0 100 140"
        preserveAspectRatio="xMidYMid slice"
      >
        {rows.flatMap((row, rowIndex) =>
          row.split("").flatMap((character, characterIndex) => {
            if (character !== "o") {
              return [];
            }

            return (
              <circle
                // biome-ignore lint/suspicious/noArrayIndexKey: static decorative pattern generated once per render, rows/characters never reorder.
                key={`${rowIndex}-${characterIndex}`}
                cx={START_X + characterIndex * STEP_X}
                cy={START_Y + rowIndex * STEP_Y}
                r="1.1"
                className={styles.circle}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}
