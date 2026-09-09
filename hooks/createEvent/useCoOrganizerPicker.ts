import { useEffect, useRef, useState } from "react";

import type { Organization } from "../../types/types";
import {
  coOrganizerOptionsFor,
  matchingCoOrganizerOptions,
} from "./arrangerOptions";

export default function useCoOrganizerPicker(
  organizations: Organization[] | undefined,
  primaryOrganizationId: string | undefined,
  selectedOrganizationIds: string[],
) {
  const [coOrganizerOpen, setCoOrganizerOpen] = useState(false);
  const [coOrganizerSearch, setCoOrganizerSearch] = useState("");
  const coOrganizerCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!coOrganizerOpen) {
      return;
    }

    const close = () => {
      setCoOrganizerOpen(false);
      setCoOrganizerSearch("");
    };

    const closeOnOutsidePointer = (event: MouseEvent | TouchEvent) => {
      const card = coOrganizerCardRef.current;
      if (card && !card.contains(event.target as Node)) {
        close();
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    document.addEventListener("touchstart", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePointer);
      document.removeEventListener("touchstart", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [coOrganizerOpen]);

  const coOrganizerOptions = coOrganizerOptionsFor(
    organizations,
    primaryOrganizationId,
  );

  return {
    coOrganizerOpen,
    setCoOrganizerOpen,
    coOrganizerSearch,
    setCoOrganizerSearch,
    coOrganizerCardRef,
    coOrganizerOptions,
    visibleCoOrganizerOptions: matchingCoOrganizerOptions(
      coOrganizerOptions,
      coOrganizerSearch,
    ),
    selectedCoOrganizerNames: coOrganizerOptions
      .filter((organization) =>
        selectedOrganizationIds.includes(organization.id),
      )
      .map((organization) => organization.label),
  };
}
