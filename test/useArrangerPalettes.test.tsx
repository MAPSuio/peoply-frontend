import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useArrangerPalettes from "../hooks/useArrangerPalettes";
import { getArrangerColor } from "../utils/arrangerColor";

const NEVER_RESOLVES = <T,>() => new Promise<T>(() => undefined);

const RED_PIXELS = Uint8ClampedArray.from([
  200, 30, 30, 255, 200, 30, 30, 255, 30, 60, 200, 255,
]);

const GREEN_PIXELS = Uint8ClampedArray.from([
  30, 190, 60, 255, 30, 190, 60, 255, 200, 40, 160, 255,
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
    const loadPixels = vi.fn(async () => {
      throw new Error("network down");
    });
    const { result } = renderHook(() =>
      useArrangerPalettes(
        [{ key: "org-d", imageUrl: "https://blob.test/d.png" }],
        loadPixels,
      ),
    );

    await waitFor(() => expect(loadPixels).toHaveBeenCalledTimes(1));
    await expect(loadPixels.mock.results[0].value).rejects.toThrow(
      "network down",
    );

    expect(result.current["org-d"]).toEqual(getArrangerColor("org-d"));
  });

  it("reaches for the picture again after a read that failed", async () => {
    let attempt = 0;
    const loadPixels = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("network down");
      return RED_PIXELS;
    });
    const { result, rerender } = renderHook(() =>
      useArrangerPalettes(
        [{ key: "org-i", imageUrl: "https://blob.test/i.png" }],
        loadPixels,
      ),
    );

    await waitFor(() => expect(loadPixels).toHaveBeenCalledTimes(1));
    await expect(loadPixels.mock.results[0].value).rejects.toThrow(
      "network down",
    );
    expect(result.current["org-i"]).toEqual(getArrangerColor("org-i"));

    rerender();

    await waitFor(() =>
      expect(result.current["org-i"]).not.toEqual(getArrangerColor("org-i")),
    );
  });

  it("drops the colors when the arranger takes its picture down", async () => {
    let sources = [{ key: "org-f", imageUrl: "https://blob.test/f.png" }];
    const { result, rerender } = renderHook(() =>
      useArrangerPalettes(sources, async () => RED_PIXELS),
    );

    await waitFor(() =>
      expect(result.current["org-f"]).not.toEqual(getArrangerColor("org-f")),
    );

    sources = [{ key: "org-f", imageUrl: undefined as unknown as string }];
    rerender();

    expect(result.current["org-f"]).toEqual(getArrangerColor("org-f"));
  });

  it("shows the colors of the picture the arranger swapped to", async () => {
    const RED_IMAGE = "https://blob.test/g-red.png";
    const GREEN_IMAGE = "https://blob.test/g-green.png";
    let sources = [{ key: "org-g", imageUrl: RED_IMAGE }];
    const { result, rerender } = renderHook(() =>
      useArrangerPalettes(sources, async (imageUrl) =>
        imageUrl === RED_IMAGE ? RED_PIXELS : GREEN_PIXELS,
      ),
    );

    await waitFor(() =>
      expect(result.current["org-g"]).not.toEqual(getArrangerColor("org-g")),
    );
    const fromRed = result.current["org-g"];

    sources = [{ key: "org-g", imageUrl: GREEN_IMAGE }];
    rerender();

    await waitFor(() => expect(result.current["org-g"]).not.toEqual(fromRed));
    expect(result.current["org-g"].accent).toContain("hsl(");
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
