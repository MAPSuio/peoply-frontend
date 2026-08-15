/**
 * Umami's tracker, as it appears on `window` once cloud.umami.is/script.js
 * has run. Declared optional on purpose: the script is deferred, absent in
 * development, and dropped outright by most content blockers, so it is
 * missing far more often than it is present.
 */
declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Sends a custom event to Umami, or does nothing at all.
 *
 * Analytics must never be able to break the thing it is measuring: a blocked
 * script, a tracker that has not finished loading, and an error thrown inside
 * it all end up as a no-op here rather than as an exception in a click
 * handler or an effect. Callers never need to guard the call themselves.
 *
 * Umami is cookieless and stores no identifiers, so events carry only what
 * the dashboard needs to tell them apart - never anything about the user.
 */
export function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  try {
    window.umami?.track(event, data);
  } catch {
    // Losing an event is always cheaper than losing the interaction.
  }
}
