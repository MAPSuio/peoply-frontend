import { afterEach, describe, expect, it, vi } from "vitest";

import { clearRuntimeCaches } from "../utils/offlineCaches";

const PRECACHE_NAME = "serwist-precache-v2-https://peoply.app/";

const cacheStorageWith = (
  cacheNames: string[],
  deleteImplementation: (cacheName: string) => Promise<boolean> = async () =>
    true,
) =>
  ({
    keys: vi.fn(async () => cacheNames),
    delete: vi.fn(deleteImplementation),
  }) as unknown as CacheStorage & {
    keys: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

const failingCacheStorage = (listingError: Error) =>
  ({
    keys: vi.fn(async () => {
      throw listingError;
    }),
    delete: vi.fn(),
  }) as unknown as CacheStorage & {
    keys: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("clearRuntimeCaches", () => {
  it("does nothing when the browser has no cache storage", async () => {
    await expect(clearRuntimeCaches(undefined)).resolves.toBeUndefined();
  });

  it("deletes runtime caches but keeps the serwist precache", async () => {
    const cacheStorage = cacheStorageWith([
      PRECACHE_NAME,
      "apis",
      "pages",
      "next-data",
    ]);

    await clearRuntimeCaches(cacheStorage);

    expect(cacheStorage.delete).toHaveBeenCalledWith("apis");
    expect(cacheStorage.delete).toHaveBeenCalledWith("pages");
    expect(cacheStorage.delete).toHaveBeenCalledWith("next-data");
    expect(cacheStorage.delete).not.toHaveBeenCalledWith(PRECACHE_NAME);
  });

  it("keeps deleting the other caches when one deletion is rejected", async () => {
    const reportedErrors = vi.spyOn(console, "error").mockImplementation(() => {
      return;
    });
    const cacheStorage = cacheStorageWith(
      ["apis", "pages", "next-data"],
      async (cacheName) => {
        if (cacheName === "pages") {
          throw new Error("quota exceeded");
        }
        return true;
      },
    );

    await expect(clearRuntimeCaches(cacheStorage)).resolves.toBeUndefined();

    expect(cacheStorage.delete).toHaveBeenCalledWith("apis");
    expect(cacheStorage.delete).toHaveBeenCalledWith("next-data");
    expect(reportedErrors).toHaveBeenCalledWith(expect.any(String), ["pages"]);
  });

  it("reports instead of throwing when the cache names cannot be listed", async () => {
    const listingError = new Error("storage unavailable");
    const reportedErrors = vi.spyOn(console, "error").mockImplementation(() => {
      return;
    });
    const cacheStorage = failingCacheStorage(listingError);

    await expect(clearRuntimeCaches(cacheStorage)).resolves.toBeUndefined();

    expect(cacheStorage.delete).not.toHaveBeenCalled();
    expect(reportedErrors).toHaveBeenCalledWith(
      expect.any(String),
      listingError,
    );
  });
});
