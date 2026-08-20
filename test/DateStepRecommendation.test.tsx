import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DateStep from "../components/create-event/DateStep";
import type { EventObjectProps } from "../hooks/useCreateEventForm";
import { InputPages } from "../types/types";

vi.mock("../components/InputPage", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("../components/create-event/EventCollisionWarning", () => ({
  default: () => null,
}));
vi.mock("../components/create-event/TimeRecommendation", () => ({
  default: ({
    onSelect,
  }: {
    onSelect: (date: string, time: string) => void;
  }) => (
    <button type="button" onClick={() => onSelect("2026-08-24", "18:00")}>
      Mandag 18:00
    </button>
  ),
}));

const eventObject = {
  currentStep: 1,
  reachedStep: 1,
  eventArrangerId: "arranger-1",
  eventDateStart: "",
  eventTimeStart: "",
  eventDateEnd: null,
  eventTimeEnd: null,
  eventHasDateEnd: false,
  eventHasRegStart: false,
  eventHasRegEnd: false,
  eventRegStartDate: "",
  eventRegStartTime: "",
  eventRegEndDate: "",
  eventRegEndTime: "",
} as EventObjectProps;

const updateEventDateStart = vi.fn();
const updateEventTimeStart = vi.fn();

function renderStep() {
  return render(
    <DateStep
      eventObject={eventObject}
      stepCount={7}
      validDataMap={new Map([[InputPages.DATE_PAGE, false]])}
      buttonOnClick={vi.fn()}
      eventDateStartValid={false}
      eventTimeStartValid={false}
      eventDateEndValid={false}
      eventTimeEndValid={false}
      regStartDateValid={false}
      regStartTimeValid={false}
      regEndDateValid={false}
      regEndTimeValid={false}
      updateEventDateStart={updateEventDateStart}
      updateEventTimeStart={updateEventTimeStart}
      setEventHasDateEnd={vi.fn()}
      updateEventDateEnd={vi.fn()}
      updateEventTimeEnd={vi.fn()}
      seteventHasRegStart={vi.fn()}
      updateEventRegStartDate={vi.fn()}
      updateEventRegStartTime={vi.fn()}
      seteventHasRegEnd={vi.fn()}
      updateEventRegEndDate={vi.fn()}
      updateEventRegEndTime={vi.fn()}
    />,
  );
}

describe("DateStep recommendation wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies the date immediately and the time after the re-render tick", async () => {
    renderStep();

    await userEvent.click(screen.getByRole("button", { name: "Mandag 18:00" }));

    expect(updateEventDateStart).toHaveBeenCalledWith(
      expect.objectContaining({ target: { value: "2026-08-24" } }),
    );
    await waitFor(() => {
      expect(updateEventTimeStart).toHaveBeenCalledWith(
        expect.objectContaining({ target: { value: "18:00" } }),
      );
    });
  });
});
