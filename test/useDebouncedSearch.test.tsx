import { render, screen, waitFor } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useDebouncedSearch from "../hooks/useDebouncedSearch";

const PROJECT_ROOT = join(__dirname, "..");
const ASYNC_TIMER = /setTimeout\(\s*async/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

function Search({
  term,
  search,
  minLength = 1,
}: {
  term: string;
  search: (term: string) => Promise<string[]>;
  minLength?: number;
}) {
  const { results, loading } = useDebouncedSearch(term, search, {
    delayMs: 300,
    minLength,
  });

  return (
    <p>{loading ? "søker" : (results ?? []).join(", ") || "ingen treff"}</p>
  );
}

describe("useDebouncedSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits out the delay before asking, so a fast typist asks once", async () => {
    const search = vi.fn().mockResolvedValue(["Ada"]);
    const { rerender } = render(<Search term="a" search={search} />);

    rerender(<Search term="ad" search={search} />);
    rerender(<Search term="ada" search={search} />);
    await vi.advanceTimersByTimeAsync(300);

    expect(search).toHaveBeenCalledExactlyOnceWith("ada");
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument());
  });

  it("does not ask at all until the term is long enough", async () => {
    const search = vi.fn().mockResolvedValue(["Ada"]);
    render(<Search term="ad" search={search} minLength={3} />);

    await vi.advanceTimersByTimeAsync(300);

    expect(search).not.toHaveBeenCalled();
    expect(screen.getByText("ingen treff")).toBeInTheDocument();
  });

  it("lets a later term win however slowly the earlier one answers", async () => {
    const slow = new Promise<string[]>((resolve) =>
      setTimeout(() => resolve(["gammelt treff"]), 5000),
    );
    const search = vi
      .fn()
      .mockReturnValueOnce(slow)
      .mockResolvedValueOnce(["nytt treff"]);

    const { rerender } = render(<Search term="ada" search={search} />);
    await vi.advanceTimersByTimeAsync(300);
    rerender(<Search term="alan" search={search} />);
    await vi.advanceTimersByTimeAsync(300);
    await vi.advanceTimersByTimeAsync(5000);

    expect(screen.getByText("nytt treff")).toBeInTheDocument();
  });

  it("stops searching when the term is cleared, rather than staying busy", async () => {
    const search = vi.fn().mockResolvedValue(["Ada"]);
    const { rerender } = render(<Search term="ada" search={search} />);
    await vi.advanceTimersByTimeAsync(300);

    rerender(<Search term="" search={search} />);

    expect(screen.getByText("ingen treff")).toBeInTheDocument();
  });

  it("gives up rather than searching forever when the request fails", async () => {
    const search = vi.fn().mockRejectedValue(new Error("nettverket falt ned"));
    render(<Search term="ada" search={search} />);

    await vi.advanceTimersByTimeAsync(300);

    await waitFor(() =>
      expect(screen.getByText("ingen treff")).toBeInTheDocument(),
    );
  });

  it("is the only place a search is debounced", () => {
    const offenders = [
      join(PROJECT_ROOT, "components"),
      join(PROJECT_ROOT, "pages"),
    ]
      .flatMap(sourceFiles)
      .filter((path) => ASYNC_TIMER.test(readFileSync(path, "utf8")))
      .map((path) => relative(PROJECT_ROOT, path));

    expect(offenders).toEqual([]);
  });
});
