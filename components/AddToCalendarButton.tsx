import { MouseEvent as ReactMouseEvent } from "react";

import useSnack from "../hooks/useSnack";
import { ButtonSize, ButtonType, Event, SnackTypes } from "../types/types";
import { downloadEventIcs } from "../utils/ics";
import Button, { IconPlacement } from "./Button";
import CalendarIconCard from "./svgs/CalendarIconCard";
import styles from "../styles/AddToCalendarButton.module.scss";

interface AddToCalendarButtonProps {
  event: Event;
  buttonText?: string;
  className?: string;
  iconPlacement?: IconPlacement;
  size?: ButtonSize;
  type?: ButtonType;
  width?: string;
}

export default function AddToCalendarButton({
  event,
  buttonText = "Legg i kalender",
  className,
  iconPlacement = IconPlacement.LEFT,
  size = ButtonSize.SMALL,
  type = ButtonType.SECONDARY,
  width,
}: AddToCalendarButtonProps) {
  const { addSnack } = useSnack();

  const handleClick = (ev: ReactMouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();

    try {
      downloadEventIcs(event);
    } catch {
      addSnack("Klarte ikke å laste ned kalenderfilen", SnackTypes.ERROR);
    }
  };

  return (
    <Button
      text={buttonText}
      type={type}
      size={size}
      width={width}
      onClick={handleClick}
      noShadow
      icon={<CalendarIconCard className={styles.icon} />}
      iconPlacement={iconPlacement}
      className={`${styles.addToCalendarButton} ${className ?? ""}`}
    />
  );
}
