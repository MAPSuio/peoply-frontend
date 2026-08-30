import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import PopupDateRangeButton from "../components/PopupDateRangeButton";
import type { Popup } from "../types/types";

const popup = {
  id: "popup-1",
  title: "Sommerstengt",
  body: "Vi holder stengt i juli.",
  startsAt: new Date(2026, 8, 7, 9, 0).toISOString(),
  endsAt: new Date(2026, 8, 9, 20, 0).toISOString(),
} as Popup;

const overnightPopup = {
  ...popup,
  startsAt: new Date(2026, 8, 7, 20, 0).toISOString(),
  endsAt: new Date(2026, 8, 8, 9, 0).toISOString(),
} as Popup;

function dayInSeptember(dayOfMonth: number) {
  return screen.getByRole("button", {
    name: new RegExp(`(^|[\\s,])${dayOfMonth}\\. september 2026`),
  });
}

function renderPicker(
  onChange = vi.fn().mockResolvedValue(undefined),
  shown: Popup = popup,
) {
  render(
    <PopupDateRangeButton popup={shown} disabled={false} onChange={onChange} />,
  );
  return onChange;
}

describe("PopupDateRangeButton", () => {
  it("treats the first click as the start of an interval, not as a saved date", async () => {
    const admin = userEvent.setup();
    const onChange = renderPicker();

    await admin.click(screen.getByRole("button", { name: "Endre datoer" }));
    await admin.click(dayInSeptember(14));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Lagre datoer" })).toBeDisabled();
  });

  it("saves the interval spanning the two clicked days, keeping the times of day", async () => {
    const admin = userEvent.setup();
    const onChange = renderPicker();

    await admin.click(screen.getByRole("button", { name: "Endre datoer" }));
    await admin.click(dayInSeptember(14));
    await admin.click(dayInSeptember(18));
    await admin.click(screen.getByRole("button", { name: "Lagre datoer" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange).toHaveBeenCalledWith({
      startsAt: new Date(2026, 8, 14, 9, 0).toISOString(),
      endsAt: new Date(2026, 8, 18, 20, 0).toISOString(),
    });
  });

  it("lets the admin pick a single day by clicking it twice", async () => {
    const admin = userEvent.setup();
    const onChange = renderPicker();

    await admin.click(screen.getByRole("button", { name: "Endre datoer" }));
    await admin.click(dayInSeptember(14));
    await admin.click(dayInSeptember(14));
    await admin.click(screen.getByRole("button", { name: "Lagre datoer" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange).toHaveBeenCalledWith({
      startsAt: new Date(2026, 8, 14, 9, 0).toISOString(),
      endsAt: new Date(2026, 8, 14, 20, 0).toISOString(),
    });
  });

  it("starts a new interval when the admin clicks on beyond a finished one", async () => {
    const admin = userEvent.setup();
    const onChange = renderPicker();

    await admin.click(screen.getByRole("button", { name: "Endre datoer" }));
    await admin.click(dayInSeptember(14));
    await admin.click(dayInSeptember(18));
    await admin.click(dayInSeptember(21));

    expect(screen.getByRole("button", { name: "Lagre datoer" })).toBeDisabled();

    await admin.click(dayInSeptember(23));
    await admin.click(screen.getByRole("button", { name: "Lagre datoer" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange).toHaveBeenCalledWith({
      startsAt: new Date(2026, 8, 21, 9, 0).toISOString(),
      endsAt: new Date(2026, 8, 23, 20, 0).toISOString(),
    });
  });

  it("ends an overnight pop-up the morning after the day it was given", async () => {
    const admin = userEvent.setup();
    const onChange = renderPicker(
      vi.fn().mockResolvedValue(undefined),
      overnightPopup,
    );

    await admin.click(screen.getByRole("button", { name: "Endre datoer" }));
    await admin.click(dayInSeptember(14));
    await admin.click(dayInSeptember(14));
    await admin.click(screen.getByRole("button", { name: "Lagre datoer" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange).toHaveBeenCalledWith({
      startsAt: new Date(2026, 8, 14, 20, 0).toISOString(),
      endsAt: new Date(2026, 8, 15, 9, 0).toISOString(),
    });
  });

  it("locks the calendar while the interval is being saved", async () => {
    const admin = userEvent.setup();
    const neverSettles = new Promise<void>(() => undefined);
    const onChange = renderPicker(vi.fn().mockReturnValue(neverSettles));

    await admin.click(screen.getByRole("button", { name: "Endre datoer" }));
    await admin.click(dayInSeptember(14));
    await admin.click(dayInSeptember(18));
    await admin.click(screen.getByRole("button", { name: "Lagre datoer" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Endre datoer" })).toBeDisabled();
    expect(dayInSeptember(21)).toBeDisabled();
  });

  it("stays open on an outside click while the interval is being saved", async () => {
    const admin = userEvent.setup();
    const neverSettles = new Promise<void>(() => undefined);
    const onChange = renderPicker(vi.fn().mockReturnValue(neverSettles));

    await admin.click(screen.getByRole("button", { name: "Endre datoer" }));
    await admin.click(dayInSeptember(14));
    await admin.click(dayInSeptember(18));
    await admin.click(screen.getByRole("button", { name: "Lagre datoer" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));

    await admin.click(document.body);

    expect(screen.getByRole("button", { name: "Lagrer …" })).toBeVisible();
  });

  it("refuses to open on a pop-up whose dates cannot be read", async () => {
    const admin = userEvent.setup();
    renderPicker(vi.fn(), { ...popup, endsAt: "ikke en dato" } as Popup);

    const toggle = screen.getByRole("button", { name: "Endre datoer" });
    expect(toggle).toBeDisabled();

    await admin.click(toggle);
    expect(screen.queryByRole("button", { name: "Lagre datoer" })).toBeNull();
  });

  it("keeps the picker open when saving fails so the admin can retry", async () => {
    const admin = userEvent.setup();
    const onChange = vi.fn().mockRejectedValue(new Error("409"));
    renderPicker(onChange);

    await admin.click(screen.getByRole("button", { name: "Endre datoer" }));
    await admin.click(dayInSeptember(14));
    await admin.click(dayInSeptember(18));
    await admin.click(screen.getByRole("button", { name: "Lagre datoer" }));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Lagre datoer" })).toBeEnabled();
  });
});
