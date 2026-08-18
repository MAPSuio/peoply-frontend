import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useScrollRestoration from "../hooks/useScrollRestoration";

function Row({ restoreKey }: { restoreKey?: string }) {
  const ref = useScrollRestoration<HTMLDivElement>(restoreKey);
  return (
    <div ref={ref} data-testid="row" style={{ overflow: "auto" }}>
      content
    </div>
  );
}

describe("useScrollRestoration", () => {
  it("restores the scroll position a row had under the same key", () => {
    const { getByTestId, unmount } = render(<Row restoreKey="row-a" />);
    const node = getByTestId("row") as HTMLDivElement;

    node.scrollLeft = 120;
    fireEvent.scroll(node);
    unmount();

    const { getByTestId: getByTestIdAgain } = render(
      <Row restoreKey="row-a" />,
    );
    const remounted = getByTestIdAgain("row") as HTMLDivElement;

    expect(remounted.scrollLeft).toBe(120);
  });

  it("does not carry a position over to a different key", () => {
    const { getByTestId, unmount } = render(<Row restoreKey="row-b" />);
    const node = getByTestId("row") as HTMLDivElement;
    node.scrollLeft = 50;
    fireEvent.scroll(node);
    unmount();

    const { getByTestId: getByTestIdAgain } = render(
      <Row restoreKey="row-c" />,
    );
    const other = getByTestIdAgain("row") as HTMLDivElement;

    expect(other.scrollLeft).toBe(0);
  });

  it("is a no-op without a key", () => {
    const { getByTestId } = render(<Row />);
    const node = getByTestId("row") as HTMLDivElement;
    node.scrollLeft = 77;

    expect(node.scrollLeft).toBe(77);
  });
});
