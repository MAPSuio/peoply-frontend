// Fetches and returns the top X most popular events.
export async function getTopXEvents(numEvents: number) {
  const url = `${process.env.API_URL}/events?take=${numEvents}`;
  const res = await fetch(url, { method: "GET", credentials: "include" });

  if (res.ok) {
    const topXEvents = await res.json();

    return topXEvents;
  } else {
    throw new Error("Could not fetch the events.");
  }
}
