/**
 * A cooldown rendered for a human: `h:mm:ss` once there is an hour left,
 * `m:ss` below that, and null at zero so callers can drop the label entirely.
 *
 * The report button's live countdown and the retry window the API sends back
 * on a 429 both formatted their seconds this way, in two copies that differed
 * only in variable names.
 */
export function formatCountdown(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return null;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
}
