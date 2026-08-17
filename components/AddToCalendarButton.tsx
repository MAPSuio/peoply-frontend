import { useEffect, useState } from "react";

import type { ButtonSize, ButtonType, Event } from "../types/types";
import { getCalendarLinks } from "../utils/ics";
import type { IconPlacement } from "./Button";
import CalendarLinksButton from "./CalendarLinksButton";

interface AddToCalendarButtonProps {
  event: Event;
  buttonText?: string;
  className?: string;
  iconPlacement?: IconPlacement;
  size?: ButtonSize;
  type?: ButtonType;
  width?: string;
  /** Icon-only rendering for narrow layouts; the text stays as the
   *  accessible name. */
  iconOnly?: boolean;
}

/* Installed PWAs can't preview or download files (iOS especially), so Apple
   devices in standalone mode get a webcal:// link that opens the native
   Calendar app instead of the .ics download. */
function shouldPreferWebcal() {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;
  const isApplePlatform = /iPad|iPhone|iPod|Macintosh/.test(
    window.navigator.userAgent,
  );

  return isStandalone && isApplePlatform;
}

export default function AddToCalendarButton({
  event,
  buttonText = "Legg i kalender",
  ...buttonProps
}: AddToCalendarButtonProps) {
  const [preferWebcal, setPreferWebcal] = useState(false);

  useEffect(() => {
    setPreferWebcal(shouldPreferWebcal());
  }, []);

  return (
    <CalendarLinksButton
      links={getCalendarLinks(event, { preferWebcal })}
      buttonText={buttonText}
      title="Legg til arrangement"
      dialogLabel="Legg arrangement i kalender"
      {...buttonProps}
    />
  );
}
