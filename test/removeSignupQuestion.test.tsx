import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import Edit from "../pages/events/[eid]/edit";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { renderWithSwr } from "./support/swr";

const QUESTION = "Dietary requirements?";
const event = { id: "event-1", formQuestion: QUESTION };
const LOAD_FAILURE = "Kunne ikke hente arrangementet";

const { addSnack, redirect, router } = vi.hoisted(() => ({
  addSnack: vi.fn(),
  redirect: vi.fn(),
  router: { query: { eid: "team-dinner" } },
}));
vi.mock("next/router", () => ({ useRouter: () => router }));
vi.mock("../hooks/useBack", () => ({ default: () => vi.fn() }));
vi.mock("../hooks/useRedirectWithReason", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../hooks/useRedirectWithReason")>()),
  default: redirect,
}));
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));
vi.mock("../components/EditSummaryPage", () => ({ default: () => null }));
vi.mock("../components/HeadComponent", () => ({ default: () => null }));
vi.mock("../services/fetchers", () => ({ fetchFromPeoplyApiJson: vi.fn() }));

const fetcher = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  router.query.eid = "team-dinner";
  fetcher.mockResolvedValue(event);
  vi.mocked(fetchFromPeoplyApiJson).mockResolvedValue({});
});

function findRegion() {
  return screen.findByRole("region", { name: "Påmeldingsspørsmål" });
}

async function confirmRemoval(user: ReturnType<typeof userEvent.setup>) {
  const region = within(await findRegion());
  await user.click(region.getByRole("button", { name: "Rediger" }));
  await user.click(region.getByRole("button", { name: "Bekreft" }));
}

it("removes an existing event question without refetching the event", async () => {
  const user = userEvent.setup();
  renderWithSwr(<Edit />, { fetcher });
  await confirmRemoval(user);
  await waitFor(() =>
    expect(screen.queryByText(QUESTION)).not.toBeInTheDocument(),
  );
  const call = vi.mocked(fetchFromPeoplyApiJson).mock.calls[0];
  if (!call) throw new Error("Missing update request");
  const [url, options] = call;
  expect(url).toBe("/events/event-1");
  expect(options?.method).toBe("PATCH");
  if (!(options?.body instanceof FormData))
    throw new Error("Missing form data");
  expect([...options.body.entries()]).toEqual([["formQuestion", ""]]);
  expect(addSnack).toHaveBeenCalledWith(
    "Påmeldingsspørsmålet er fjernet",
    expect.anything(),
  );
  expect(fetcher).toHaveBeenCalledTimes(1);
});

it("keeps the question available for retry when removal fails", async () => {
  vi.mocked(fetchFromPeoplyApiJson).mockRejectedValue(new Error("Offline"));
  const user = userEvent.setup();
  renderWithSwr(<Edit />, { fetcher });
  await confirmRemoval(user);
  await waitFor(() => expect(addSnack).toHaveBeenCalled());
  expect(screen.getByText(QUESTION)).toBeInTheDocument();
  expect(
    within(await findRegion()).getByRole("button", { name: "Rediger" }),
  ).toBeEnabled();
});

it("shows the question of the next event after a removal", async () => {
  fetcher.mockImplementation(async (key: string) =>
    key === "/events/team-lunch"
      ? { id: "event-2", formQuestion: "Any allergies?" }
      : event,
  );
  const user = userEvent.setup();
  const { rerender } = renderWithSwr(<Edit />, { fetcher });
  await confirmRemoval(user);
  await waitFor(() =>
    expect(screen.queryByText(QUESTION)).not.toBeInTheDocument(),
  );
  router.query.eid = "team-lunch";
  rerender(<Edit />);
  expect(await screen.findByText("Any allergies?")).toBeInTheDocument();
});

it("cancels removal without changing the event", async () => {
  const user = userEvent.setup();
  renderWithSwr(<Edit />, { fetcher });
  const region = within(await findRegion());
  await user.click(region.getByRole("button", { name: "Rediger" }));
  await user.click(region.getByRole("button", { name: "Avbryt" }));
  expect(screen.getByText(QUESTION)).toBeInTheDocument();
  expect(fetchFromPeoplyApiJson).not.toHaveBeenCalled();
});

it("keeps the edit form when refreshing a loaded event fails", async () => {
  const onError = vi.fn();
  fetcher.mockRejectedValue(new Error("Offline"));
  renderWithSwr(<Edit />, {
    fetcher,
    onError,
    shouldRetryOnError: false,
    fallback: { "/events/team-dinner": event },
  });
  await waitFor(() => expect(onError).toHaveBeenCalled());
  await findRegion();
  expect(redirect).not.toHaveBeenCalledWith(
    expect.objectContaining({ reason: LOAD_FAILURE }),
  );
});

it("leaves the edit page when the event cannot be loaded", async () => {
  fetcher.mockRejectedValue(new Error("Offline"));
  renderWithSwr(<Edit />, { fetcher, shouldRetryOnError: false });
  await waitFor(() =>
    expect(redirect).toHaveBeenLastCalledWith(
      expect.objectContaining({ reason: LOAD_FAILURE }),
    ),
  );
});
