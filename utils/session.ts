const SESSION_MARKER_COOKIE_NAME = "has_session";

export function hasSessionMarker(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .some(
      (cookie) =>
        cookie.trimStart().split("=")[0] === SESSION_MARKER_COOKIE_NAME,
    );
}
