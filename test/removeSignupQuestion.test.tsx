import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import EditSignupQuestion from "../components/summary/EditSignupQuestion";
import type { Event } from "../types/types";
import Edit from "../pages/events/[eid]/edit";
import { fetchFromPeoplyApiJson } from "../services/fetchers";

const { event, addSnack, mutate } = vi.hoisted(() => ({
  event: { id: "event-1", formQuestion: "Dietary requirements?" },
  addSnack: vi.fn(),
  mutate: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("next/router", () => ({
  useRouter: () => ({ query: { eid: "event-1" } }),
}));
vi.mock("../hooks/useBack", () => ({ default: () => vi.fn() }));
vi.mock("../hooks/useRedirectWithReason", () => ({
  default: vi.fn(),
  blockingReason: vi.fn(),
}));
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));
vi.mock("swr", () => ({
  default: () => ({ data: event }),
  useSWRConfig: () => ({ mutate }),
}));
vi.mock("../components/EditSummaryPage", () => ({ default: () => null }));
vi.mock("../components/HeadComponent", () => ({ default: () => null }));
vi.mock("../services/fetchers", () => ({ fetchFromPeoplyApiJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  mutate.mockResolvedValue(undefined);
  vi.mocked(fetchFromPeoplyApiJson).mockResolvedValue({});
});

async function confirmRemoval(user: ReturnType<typeof userEvent.setup>) {
  const region = screen.getByRole("region", { name: "Signup question" });
  const edit = region.querySelector("button button");
  if (!(edit instanceof HTMLElement)) throw new Error("Missing edit button");
  await user.click(edit);
  const accept = region.querySelector('button[class*="check"]');
  if (!(accept instanceof HTMLElement))
    throw new Error("Missing accept button");
  await user.click(accept);
}

it("removes an existing event question and refreshes the event", async () => {
  const user = userEvent.setup();
  render(<Edit />);
  await confirmRemoval(user);
  await waitFor(() => expect(mutate).toHaveBeenCalledWith("/events/event-1"));
  const call = vi.mocked(fetchFromPeoplyApiJson).mock.calls[0];
  if (!call) throw new Error("Missing update request");
  const [url, options] = call;
  expect(url).toBe("/events/event-1");
  expect(options?.method).toBe("PATCH");
  if (!(options?.body instanceof FormData))
    throw new Error("Missing form data");
  expect([...options.body.entries()]).toEqual([["formQuestion", ""]]);
  expect(screen.queryByText("Dietary requirements?")).not.toBeInTheDocument();
});

it("keeps the question available for retry when removal fails", async () => {
  vi.mocked(fetchFromPeoplyApiJson).mockRejectedValue(new Error("Offline"));
  const user = userEvent.setup();
  render(<Edit />);
  await confirmRemoval(user);
  await waitFor(() => expect(addSnack).toHaveBeenCalled());
  expect(screen.getByText("Dietary requirements?")).toBeInTheDocument();
  expect(
    screen
      .getByRole("region", { name: "Signup question" })
      .querySelector("button"),
  ).toBeEnabled();
  expect(mutate).not.toHaveBeenCalled();
});

it("reports success when refreshing the cache fails after removal", async () => {
  mutate.mockRejectedValue(new Error("Offline"));
  const user = userEvent.setup();
  render(<Edit />);
  await confirmRemoval(user);
  await waitFor(() =>
    expect(addSnack).toHaveBeenCalledWith(
      "Signup question removed",
      expect.anything(),
    ),
  );
  expect(screen.queryByText("Dietary requirements?")).not.toBeInTheDocument();
});

it("shows the question when navigating to another event after removal", async () => {
  const user = userEvent.setup();
  const { rerender } = render(<EditSignupQuestion event={event as Event} />);
  await confirmRemoval(user);
  await waitFor(() =>
    expect(screen.queryByText("Dietary requirements?")).not.toBeInTheDocument(),
  );
  rerender(<EditSignupQuestion event={{ ...event, id: "event-2" } as Event} />);
  expect(
    screen
      .getByRole("region", { name: "Signup question" })
      .querySelector("button"),
  ).toBeEnabled();
});

it("cancels removal without changing the event", async () => {
  const user = userEvent.setup();
  render(<Edit />);
  const region = screen.getByRole("region", { name: "Signup question" });
  const edit = region.querySelector("button button");
  if (!(edit instanceof HTMLElement)) throw new Error("Missing edit button");
  await user.click(edit);
  const cancel = region.querySelector('button[class*="cross"]');
  if (!(cancel instanceof HTMLElement))
    throw new Error("Missing cancel button");
  await user.click(cancel);
  expect(screen.getByText("Dietary requirements?")).toBeInTheDocument();
  expect(fetchFromPeoplyApiJson).not.toHaveBeenCalled();
});
