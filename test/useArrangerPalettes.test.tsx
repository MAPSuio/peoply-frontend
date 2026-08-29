import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useArrangerPalettes from "../hooks/useArrangerPalettes";
import { getArrangerColor } from "../utils/arrangerColor";

const NEVER_RESOLVES = <T,>() => new Promise<T>(() => undefined);

const RED_PIXELS = Uint8ClampedArray.from([
  200, 30, 30, 255, 200, 30, 30, 255, 30, 60, 200, 255,
]);

describe("useArrangerPalettes", () => {
  it("starts on the fallback color so the calendar paints before any image loads", () => {
    const { result } = renderHook(() =>
      useArrangerPalettes(
        [{ key: "org-a", imageUrl: "https://blob.test/a.png" }],
        NEVER_RESOLVES<Uint8ClampedArray>,
      ),
    );

    expect(result.current["org-a"]).toEqual(getArrangerColor("org-a"));
  });

  it("replaces the fallback with the colors read from the picture", async () => {
    const { result } = renderHook(() =>
      useArrangerPalettes(
        [{ key: "org-b", imageUrl: "https://blob.test/b.png" }],
        async () => RED_PIXELS,
      ),
    );

    await waitFor(() =>
      expect(result.current["org-b"]).not.toEqual(getArrangerColor("org-b")),
    );
  });

  it("reads each picture once, however many events an arranger has", async () => {
    const loadPixels = vi.fn(async () => RED_PIXELS);
    const sources = [
      { key: "org-c", imageUrl: "https://blob.test/c.png" },
      { key: "org-c", imageUrl: "https://blob.test/c.png" },
    ];

    const { result, rerender } = renderHook(() =>
      useArrangerPalettes(sources, loadPixels),
    );

    await waitFor(() =>
      expect(result.current["org-c"]).not.toEqual(getArrangerColor("org-c")),
    );
    rerender();

    expect(loadPixels).toHaveBeenCalledTimes(1);
  });

  it("keeps the fallback when the picture cannot be read", async () => {
    const { result } = renderHook(() =>
      useArrangerPalettes(
        [{ key: "org-d", imageUrl: "https://blob.test/d.png" }],
        async () => {
          throw new Error("network down");
        },
      ),
    );

    await waitFor(() => expect(result.current["org-d"]).toBeDefined());
    expect(result.current["org-d"]).toEqual(getArrangerColor("org-d"));
  });

  it("falls back without reaching for an image when the arranger has none", () => {
    const loadPixels = vi.fn(async () => RED_PIXELS);
    const { result } = renderHook(() =>
      useArrangerPalettes([{ key: "org-e" }], loadPixels),
    );

    expect(result.current["org-e"]).toEqual(getArrangerColor("org-e"));
    expect(loadPixels).not.toHaveBeenCalled();
  });
});
