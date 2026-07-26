// This is a best-effort call to a third-party service, unrelated to the
// Peoply API, so it doesn't go through fetchFromPeoplyApi - but a hung
// request would still delay the auth bootstrap in useUser, so it gets its
// own short timeout.
const TIMEOUT_MS = 5_000;

export async function fetchIpInfo() {
  const url = "https://ipapi.co/json/";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    // Covers both a real network failure and our own abort - either way, IP
    // info is optional, so absence is a fine answer.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
