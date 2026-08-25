import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";

import BackgroundPattern from "../components/BackgroundPattern";
import { setBackgroundPatternEnabled } from "../utils/backgroundPattern";

const patternTestId = "background-pattern";

describe("BackgroundPattern", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("draws nothing for a visitor who has never touched the preference", () => {
    render(<BackgroundPattern />);

    expect(screen.queryByTestId(patternTestId)).not.toBeInTheDocument();
  });

  /* The server has no localStorage, so it always renders nothing. A first
     client render that disagrees is a hydration mismatch. */
  it("renders nothing on the first pass even when the preference is on", () => {
    setBackgroundPatternEnabled(true);

    expect(renderToString(<BackgroundPattern />)).toBe("");
  });

  it("appears after mount when the preference is already on", () => {
    setBackgroundPatternEnabled(true);

    render(<BackgroundPattern />);

    expect(screen.getByTestId(patternTestId)).toBeInTheDocument();
  });

  it("appears once the preference is turned on", () => {
    render(<BackgroundPattern />);

    act(() => setBackgroundPatternEnabled(true));

    expect(screen.getByTestId(patternTestId)).toBeInTheDocument();
  });

  it("disappears again when the preference is turned off", () => {
    setBackgroundPatternEnabled(true);
    render(<BackgroundPattern />);

    act(() => setBackgroundPatternEnabled(false));

    expect(screen.queryByTestId(patternTestId)).not.toBeInTheDocument();
  });
});
