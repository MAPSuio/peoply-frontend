import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import EditSummaryPage from "../components/EditSummaryPage";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { type Event, EventRegistrationMode, Visibility } from "../types/types";

vi.mock("next/router", () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock("../hooks/useUser", () => ({ default: () => ({}) }));
vi.mock("../hooks/useSnack", () => ({
  default: () => ({ addSnack: vi.fn() }),
}));
vi.mock("../hooks/useRegistrationCount", () => ({ default: () => ({}) }));
vi.mock("swr", () => ({ default: () => ({ data: [] }) }));
vi.mock("../services/fetchers", () => ({
  fetchFromPeoplyApiJson: vi.fn().mockResolvedValue({}),
  fetchAllFromPeoplyApiJson: vi.fn(),
}));
vi.mock("../components/summary/EditTitleSection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/EditCoOrganizerSection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/EditDateTimeSection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/EditPlaceSection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/EditDescriptionSection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/EditCategorySection", () => ({
  default: () => null,
}));
vi.mock("../components/summary/EditImageSection", () => ({
  default: () => null,
}));

const event = {
  id: "event-1",
  title: "Dinner",
  description: "Team dinner",
  startDate: "2027-01-01T12:00:00Z",
  visibility: Visibility.PUBLIC,
  registrationMode: EventRegistrationMode.PEOPLY,
  formQuestion: "Dietary requirements?",
  capacity: null,
  locationName: "Office",
  eventCategories: [],
  eventArrangers: [],
} as unknown as Event;

it.each([true, false])(
  "persists removal only when accepted: %s",
  async (accept) => {
    vi.mocked(fetchFromPeoplyApiJson).mockClear();
    const user = userEvent.setup();
    render(<EditSummaryPage event={event} />);
    const editButton = screen
      .getByText("Dietary requirements?")
      .closest("button")
      ?.querySelector("button");
    if (!editButton) throw new Error("Missing edit control");
    await user.click(editButton);
    await user.click(
      screen.getByRole("button", { name: "Remove signup question" }),
    );
    const action = document.querySelector<HTMLButtonElement>(
      accept ? 'button[class*="check"]' : 'button[class*="cross"]',
    );
    if (!action) throw new Error("Missing accept or cancel control");
    await user.click(action);
    const save = screen.getByRole("button", { name: "Lagre endringer" });
    if (!accept) {
      expect(screen.getByText("Dietary requirements?")).toBeInTheDocument();
      expect(save).toBeDisabled();
      expect(fetchFromPeoplyApiJson).not.toHaveBeenCalled();
      return;
    }
    await user.click(save);
    await waitFor(() => expect(fetchFromPeoplyApiJson).toHaveBeenCalled());
    const call = vi.mocked(fetchFromPeoplyApiJson).mock.calls.at(-1);
    if (!call) throw new Error("Missing update request");
    const [url, options] = call;
    expect(url).toBe("/events/event-1");
    expect(options?.method).toBe("PATCH");
    if (!(options?.body instanceof FormData))
      throw new Error("Missing form data");
    expect(options.body.get("formQuestion")).toBe("");
  },
);
