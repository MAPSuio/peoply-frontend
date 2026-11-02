import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { useSWRConfig } from "swr";
import Edit from "../pages/events/[eid]/edit";
import { renderWithSwr } from "./support/swr";

const EVENT_KEY = "/events/team-dinner";
const event = {
  id: "event-1",
  urlId: "team-dinner",
  title: "Team dinner",
  description: "An evening together at the office.",
  startDate: "2027-01-15T17:00:00.000Z",
  endDate: "2027-01-15T20:00:00.000Z",
  eventCategories: [],
  eventArrangers: [],
  visibility: "PUBLIC",
  registrationMode: "PEOPLY",
  capacity: 30,
  locationName: "Office",
};

const { router } = vi.hoisted(() => ({
  router: {
    isReady: true,
    query: { eid: "team-dinner" },
    replace: vi.fn(),
    back: vi.fn(),
    push: vi.fn(),
  },
}));
vi.mock("next/router", () => ({ useRouter: () => router }));
vi.mock("../hooks/useBack", () => ({ default: () => vi.fn() }));
vi.mock("../hooks/useSnack", () => ({
  default: () => ({ addSnack: vi.fn() }),
}));
vi.mock("../hooks/useUser", () => ({ default: () => ({ ipInfo: undefined }) }));
vi.mock("../hooks/useRegistrationCount", () => ({
  default: () => ({ data: 0 }),
}));
vi.mock("../components/HeadComponent", () => ({ default: () => null }));

function RefreshEvent() {
  const { mutate } = useSWRConfig();
  return (
    <button type="button" onClick={() => void mutate(EVENT_KEY)}>
      Refresh event
    </button>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

it("keeps an unsaved edit when refreshing the event fails", async () => {
  const fetcher = vi.fn(async (key: string) => {
    if (key === EVENT_KEY) return event;
    return [];
  });
  const onError = vi.fn();
  const user = userEvent.setup();
  renderWithSwr(
    <>
      <RefreshEvent />
      <Edit />
    </>,
    { fetcher, onError, shouldRetryOnError: false },
  );

  const titleCard = await screen.findByText("Team dinner");
  const editButton = titleCard.parentElement?.querySelector("button");
  if (!editButton) throw new Error("Missing title edit button");
  await user.click(editButton);
  const input = screen.getByRole("textbox", {
    name: /Endre tittel på arrangementet/,
  });
  await user.clear(input);
  await user.type(input, "Unsaved title");
  await user.click(screen.getByRole("button", { name: "Bekreft" }));
  expect(screen.getByText("Unsaved title")).toBeInTheDocument();

  fetcher.mockImplementation(async (key: string) => {
    if (key === EVENT_KEY) throw new Error("Offline");
    return [];
  });
  await user.click(screen.getByRole("button", { name: "Refresh event" }));
  await waitFor(() => expect(onError).toHaveBeenCalled());

  await waitFor(() =>
    expect(screen.getByText("Unsaved title")).toBeInTheDocument(),
  );
  expect(router.replace).not.toHaveBeenCalled();
});
