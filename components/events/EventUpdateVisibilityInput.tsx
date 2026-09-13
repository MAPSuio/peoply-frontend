import { useTheme } from "next-themes";

import { EventUpdateVisibility } from "../../types/types";
import RadioInput from "../inputs/RadioInput";
import PublicIcon from "../svgs/PublicIcon";
import UserCheck from "../svgs/UserCheck";
import UserCheckLight from "../svgs/UserCheckLight";

export interface EventUpdateVisibilityInputProps {
  visibility: EventUpdateVisibility;
  onChange: (visibility: EventUpdateVisibility) => void;
}

export default function EventUpdateVisibilityInput({
  visibility,
  onChange,
}: EventUpdateVisibilityInputProps) {
  const { theme } = useTheme();

  return (
    <RadioInput
      optionsAndIcons={[
        {
          id: EventUpdateVisibility.ALL,
          text: "Offentlig",
          hintText:
            "Oppdateringen kan ses på arrangementsiden av alle brukere på platformen.",
          icon: PublicIcon,
          active: visibility === EventUpdateVisibility.ALL,
        },
        {
          id: EventUpdateVisibility.GOING,
          text: "Kun deltakere",
          hintText:
            "Oppdateringen kan kun ses på arrangementsiden av deltakere.",
          icon: theme === "light" ? UserCheckLight : UserCheck,
          active: visibility === EventUpdateVisibility.GOING,
        },
      ]}
      onClick={onChange}
      label="Synlighet på arrangementsiden"
    />
  );
}
