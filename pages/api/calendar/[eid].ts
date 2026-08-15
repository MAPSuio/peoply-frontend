import type { NextApiRequest, NextApiResponse } from "next";

import type { Event } from "../../../types/types";
import { isValidEventId } from "../../../utils/eventId";
import { createEventIcs } from "../../../utils/ics";

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { eid } = req.query;
  const eventId = Array.isArray(eid) ? eid[0] : eid;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!eventId || !apiBaseUrl || !isValidEventId(eventId)) {
    res.status(400).json({ message: "Missing calendar event configuration" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `${apiBaseUrl}/events/${encodeURIComponent(eventId)}`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      res.status(response.status).json({ message: "Event not found" });
      return;
    }

    const event = (await response.json()) as Event;
    const fileName = `${sanitizeFileName(
      event.urlId || event.id || event.title,
    )}.ics`;

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.status(200).send(createEventIcs(event));
  } catch {
    res.status(502).json({ message: "Failed to generate calendar event" });
  } finally {
    clearTimeout(timeout);
  }
}
