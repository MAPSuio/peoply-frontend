/**
 * Thrown by the fetch helpers in fetchers.ts instead of a raw `Response`, so
 * callers can use `instanceof ApiError` rather than `instanceof Response` /
 * `as Response` sniffing to branch on a failed request.
 */
export class ApiError extends Error {
  /** HTTP status of the failed response. 0 when no response ever arrived (see ApiTimeoutError). */
  readonly status: number;
  /** The resource path that was requested, for logging/debugging. */
  readonly path: string;
  /**
   * The response body, parsed as JSON when possible and left as text
   * otherwise. Undefined when the body was empty or could not be read.
   */
  readonly body?: unknown;

  constructor(message: string, status: number, path: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

/**
 * Thrown when a request is aborted for exceeding its timeout, or fails
 * before any response arrives at all (offline, DNS failure, CORS, etc).
 * Kept distinct from a plain ApiError so callers can tell "the server never
 * actually answered" apart from a real HTTP error status - status is always
 * 0 here since there is no response to read one from.
 */
export class ApiTimeoutError extends ApiError {
  constructor(path: string) {
    super(
      `Request to ${path} timed out or failed before a response arrived`,
      0,
      path,
    );
    this.name = "ApiTimeoutError";
  }
}
