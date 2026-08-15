/* Event route params are either a generated urlId (8 letters, A-Z) or the
   event UUID. Anything else must never reach a server-side fetch URL, since
   the value would otherwise be able to steer the request to another path on
   the internal API (SSRF). */
/* `$` would also match in front of a trailing newline, so the end of the
   string is anchored explicitly. */
const EVENT_ID_PATTERN =
  /^(?:[A-Za-z]{8}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?![\s\S])/;

export function isValidEventId(value: string): boolean {
  return EVENT_ID_PATTERN.test(value);
}
