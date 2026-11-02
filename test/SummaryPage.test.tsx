import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { expect, it, vi } from "vitest";
import SummaryPage from "../components/SummaryPage";

vi.mock("../hooks/useUser", () => ({ default: () => ({ orgs: [] }) }));
vi.mock("../utils/functions", () => ({
  throwNotImportedError: () => undefined,
  formatDateAndTime: () => "2026-11-02T12:00:00Z",
}));
vi.mock("../components/Button", () => ({ default: () => null }));
vi.mock("../components/BackButton", () => ({ default: () => null }));
vi.mock("../components/ProgressBar", () => ({ default: () => null }));
vi.mock("../components/summary/DateTimeSummarySection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/PlaceSummarySection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/DescriptionSummarySection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/ImageSummarySection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/DataSummarySection", () => ({
  default: () => null,
}));

it.each([false, true])(
  "sends the question field when enabled is %s",
  (enabled) => {
    const set = vi.spyOn(FormData.prototype, "set");
    render(
      <SummaryPage
        {...({
          validDataMap: new Map(),
          eventObject: {
            eventArrangerId: "organizer",
            eventHasFormQuestion: enabled,
            eventFormQuestion: "Dietary requirements?",
            eventActiveCategories: [],
            eventCoOrganizerOrganizationIds: [],
          },
          selectedCoOrganizerNames: [],
          summaryCategories: [],
        } as unknown as ComponentProps<typeof SummaryPage>)}
      />,
    );
    expect(set).toHaveBeenCalledWith(
      "formQuestion",
      enabled ? "Dietary requirements?" : "",
    );
    set.mockRestore();
  },
);
