import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import useSWR from "swr";
import Edit from "../pages/events/[eid]/edit";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { renderWithSwr } from "./support/swr";

const QUESTION = "Dietary requirements?";
const event = { id: "event-1", urlId: "team-dinner", formQuestion: QUESTION };
const nextEvent = {
  id: "event-2",
  urlId: "team-lunch",
  formQuestion: "Any allergies?",
};
const LOAD_FAILURE = "Kunne ikke hente arrangementet";
const REMOVE_LABEL = "Fjern spørsmålet";

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

async function openConfirmation(user: ReturnType<typeof userEvent.setup>) {
  const region = within(await findRegion());
  await user.click(region.getByRole("button", { name: REMOVE_LABEL }));
}

async function confirmRemoval(user: ReturnType<typeof userEvent.setup>) {
  await openConfirmation(user);
  const dialog = within(screen.getByRole("dialog"));
  await user.click(dialog.getByRole("button", { name: "Fjern" }));
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
    within(await findRegion()).getByRole("button", { name: REMOVE_LABEL }),
  ).toBeEnabled();
});

it("disables the trashcan while the removal is running", async () => {
  vi.mocked(fetchFromPeoplyApiJson).mockReturnValue(
    new Promise(() => undefined),
  );
  const user = userEvent.setup();
  renderWithSwr(<Edit />, { fetcher });
  await confirmRemoval(user);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(
    within(await findRegion()).getByRole("button", { name: REMOVE_LABEL }),
  ).toBeDisabled();
});

it("shows the question of the next event after a removal", async () => {
  fetcher.mockImplementation(async (key: string) =>
    key === "/events/team-lunch" ? nextEvent : event,
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

it("closes the confirmation when moving to another cached event", async () => {
  fetcher.mockImplementation(async (key: string) =>
    key === "/events/team-lunch" ? nextEvent : event,
  );
  const user = userEvent.setup();
  const { rerender } = renderWithSwr(<Edit />, {
    fetcher,
    fallback: { "/events/team-lunch": nextEvent },
  });
  await openConfirmation(user);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  router.query.eid = "team-lunch";
  rerender(<Edit />);
  expect(await screen.findByText("Any allergies?")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("changes only the question in the cached event page when the editor was opened by id", async () => {
  function CachedEventPage() {
    const { data } = useSWR<typeof event & { title?: string }>(
      "/events/team-dinner",
    );
    return (
      <>
        <output aria-label="Cached question">{data?.formQuestion}</output>
        <output aria-label="Cached title">{data?.title}</output>
      </>
    );
  }
  router.query.eid = "event-1";
  fetcher.mockImplementation(async (key: string) =>
    key === "/events/team-dinner" ? { ...event, title: "Newer title" } : event,
  );
  const user = userEvent.setup();
  renderWithSwr(
    <>
      <CachedEventPage />
      <Edit />
    </>,
    { fetcher },
  );
  await waitFor(() =>
    expect(screen.getByLabelText("Cached question")).toHaveTextContent(
      QUESTION,
    ),
  );
  await confirmRemoval(user);
  await waitFor(() =>
    expect(screen.getByLabelText("Cached question")).toBeEmptyDOMElement(),
  );
  expect(screen.getByLabelText("Cached title")).toHaveTextContent(
    "Newer title",
  );
});

it("cancels removal without changing the event", async () => {
  const user = userEvent.setup();
  renderWithSwr(<Edit />, { fetcher });
  await openConfirmation(user);
  await user.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Avbryt" }),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText(QUESTION)).toBeInTheDocument();
  expect(fetchFromPeoplyApiJson).not.toHaveBeenCalled();
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
