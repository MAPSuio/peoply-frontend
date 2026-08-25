import useBackgroundPatternPreference from "../hooks/useBackgroundPatternPreference";

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
  const [enabled] = useBackgroundPatternPreference();

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
