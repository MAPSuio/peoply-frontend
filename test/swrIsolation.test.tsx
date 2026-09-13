import { screen, waitFor } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import useSWR from "swr";
import { describe, expect, it, vi } from "vitest";

import { renderWithSwr } from "./support/swr";

const PROJECT_ROOT = join(__dirname, "..");
const TESTS = __dirname;
const SWR_CONFIG_IMPORT = /import\s*\{[^}]*\bSWRConfig\b[^}]*\}\s*from\s*"swr"/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return [".ts", ".tsx"].includes(extname(entry.name)) ? [path] : [];
  });
}

function Count() {
  const { data } = useSWR<number>("/count");
  return <p>{data ?? "venter"}</p>;
}

describe("renderWithSwr", () => {
  it("hands each render a cache of its own, so one answer never serves the next test", async () => {
    const fetcher = vi.fn().mockResolvedValue(1);

    const first = renderWithSwr(<Count />, { fetcher });
    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());
    first.unmount();

    fetcher.mockResolvedValue(2);
    renderWithSwr(<Count />, { fetcher });

    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
  });

  it("keeps the isolated cache when a test configures SWR further", async () => {
    const fetcher = vi.fn().mockResolvedValue(7);

    renderWithSwr(<Count />, { fetcher, dedupingInterval: 0 });

    await waitFor(() => expect(screen.getByText("7")).toBeInTheDocument());
  });

  it("rerenders inside the same cache it started in", async () => {
    const fetcher = vi.fn().mockResolvedValue(3);

    const { rerender } = renderWithSwr(<Count />, { fetcher });
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
    rerender(<Count />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("is the only way a test renders a component that uses SWR", () => {
    const offenders = sourceFiles(TESTS)
      .filter((path) => SWR_CONFIG_IMPORT.test(readFileSync(path, "utf8")))
      .map((path) => relative(PROJECT_ROOT, path))
      .filter((path) => path !== "test/support/swr.tsx");

    expect(offenders).toEqual([]);
  });
});
