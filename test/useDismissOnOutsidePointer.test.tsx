import { act, render } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";

import useDismissOnOutsidePointer from "../hooks/useDismissOnOutsidePointer";

function Panel() {
  const [open, setOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismissOnOutsidePointer(containerRef, () => setOpen(false));

  return (
    <div>
      <div ref={containerRef}>
        <button type="button" data-testid="inside">
          inside
        </button>
        {open && <p data-testid="panel">open</p>}
      </div>
      <button type="button" data-testid="outside">
        outside
      </button>
    </div>
  );
}

function pointerDownOn(element: Element) {
  act(() => {
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  });
}

describe("useDismissOnOutsidePointer", () => {
  it("keeps the panel open when the pointer lands inside", () => {
    const { getByTestId, queryByTestId } = render(<Panel />);

    pointerDownOn(getByTestId("inside"));

    expect(queryByTestId("panel")).not.toBeNull();
  });

  it("dismisses the panel when the pointer lands outside", () => {
    const { getByTestId, queryByTestId } = render(<Panel />);

    pointerDownOn(getByTestId("outside"));

    expect(queryByTestId("panel")).toBeNull();
  });

  it("stops listening once the component is gone", () => {
    const { unmount, getByTestId } = render(<Panel />);
    const outside = getByTestId("outside");

    unmount();

    expect(() => pointerDownOn(outside)).not.toThrow();
  });
});
