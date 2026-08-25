import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";

import useBackgroundPatternPreference from "../hooks/useBackgroundPatternPreference";
import { setBackgroundPatternEnabled } from "../utils/backgroundPattern";

function PreferenceProbe() {
  const [enabled, setEnabled] = useBackgroundPatternPreference();

  return (
    <button type="button" onClick={() => setEnabled(!enabled)}>
      {enabled ? "on" : "off"}
    </button>
  );
}

describe("useBackgroundPatternPreference", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("reports off on the first pass even when storage says otherwise", () => {
    setBackgroundPatternEnabled(true);

    expect(renderToString(<PreferenceProbe />)).toContain("off");
  });

  it("catches up with the stored preference after mount", () => {
    setBackgroundPatternEnabled(true);

    render(<PreferenceProbe />);

    expect(screen.getByRole("button")).toHaveTextContent("on");
  });

  it("persists what the user chooses", async () => {
    render(<PreferenceProbe />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent("on");
  });

  it("follows a change made elsewhere in the app", () => {
    render(<PreferenceProbe />);

    act(() => setBackgroundPatternEnabled(true));

    expect(screen.getByRole("button")).toHaveTextContent("on");
  });
});
