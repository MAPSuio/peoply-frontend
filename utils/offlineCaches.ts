const PRECACHE_NAME_FRAGMENT = "precache";

const holdsPrecachedAppShell = (cacheName: string) =>
  cacheName.includes(PRECACHE_NAME_FRAGMENT);

export async function clearRuntimeCaches(
  cacheStorage: CacheStorage | undefined,
): Promise<void> {
  if (!cacheStorage) {
    return;
  }

  let cacheNames: string[];

  try {
    cacheNames = await cacheStorage.keys();
  } catch (error) {
    console.error("Could not list offline caches on account exit:", error);
    return;
  }

  const runtimeCacheNames = cacheNames.filter(
    (cacheName) => !holdsPrecachedAppShell(cacheName),
  );

  const deletions = await Promise.allSettled(
    runtimeCacheNames.map((cacheName) => cacheStorage.delete(cacheName)),
  );

  const undeletedCacheNames = runtimeCacheNames.filter(
    (_, index) => deletions[index].status === "rejected",
  );

  if (undeletedCacheNames.length > 0) {
    console.error(
      "Could not clear offline caches on account exit:",
      undeletedCacheNames,
    );
  }
}
