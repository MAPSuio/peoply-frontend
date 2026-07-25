import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Modal from "../components/Modal";

function renderModal(onClose = vi.fn()) {
  const result = render(
    <Modal label="Slett arrangement" closeButtonOnClick={onClose}>
      <>
        <button type="button">Bekreft</button>
        <button type="button">Avbryt</button>
      </>
    </Modal>,
  );

  return { onClose, ...result };
}

describe("Modal", () => {
  it("exposes itself as a dialog named by its own title", () => {
    renderModal();

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Slett arrangement");
  });

  it("gives each dialog its own title id", () => {
    render(
      <>
        <Modal label="Første">
          <span>a</span>
        </Modal>
        <Modal label="Andre">
          <span>b</span>
        </Modal>
      </>,
    );

    const [first, second] = screen.getAllByRole("dialog");

    expect(first.getAttribute("aria-labelledby")).not.toBe(
      second.getAttribute("aria-labelledby"),
    );
    expect(first).toHaveAccessibleName("Første");
    expect(second).toHaveAccessibleName("Andre");
  });

  it("moves focus into the dialog on open", () => {
    renderModal();

    expect(screen.getByRole("dialog")).toContainElement(
      document.activeElement as HTMLElement,
    );
  });

  it("restores focus to the opener on close", async () => {
    const user = userEvent.setup();

    /* Something outside the dialog has to hold focus first. */
    const { rerender } = render(<button type="button">Åpne</button>);
    const opener = screen.getByRole("button", { name: "Åpne" });
    await user.click(opener);
    expect(opener).toHaveFocus();

    rerender(
      <>
        <button type="button">Åpne</button>
        <Modal label="Tittel">
          <button type="button">Bekreft</button>
        </Modal>
      </>,
    );
    expect(opener).not.toHaveFocus();

    rerender(<button type="button">Åpne</button>);
    expect(opener).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stops listening for Escape once unmounted", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { unmount } = renderModal(onClose);

    unmount();
    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("wraps Tab from the last focusable element back to the first", async () => {
    const user = userEvent.setup();
    renderModal();

    const close = screen.getByRole("button", { name: "Lukk" });
    const cancel = screen.getByRole("button", { name: "Avbryt" });

    cancel.focus();
    await user.tab();

    expect(close).toHaveFocus();
  });

  it("wraps Shift+Tab from the first focusable element back to the last", async () => {
    const user = userEvent.setup();
    renderModal();

    const close = screen.getByRole("button", { name: "Lukk" });
    const cancel = screen.getByRole("button", { name: "Avbryt" });

    close.focus();
    await user.tab({ shift: true });

    expect(cancel).toHaveFocus();
  });

  it("closes when the close button is pressed", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole("button", { name: "Lukk" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("survives being rendered without a close handler", async () => {
    const user = userEvent.setup();
    render(
      <Modal label="Tittel">
        <span>innhold</span>
      </Modal>,
    );

    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
