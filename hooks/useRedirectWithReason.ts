import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { SnackTypes } from "../types/types";
import useSnack from "./useSnack";

export interface RedirectWithReason {
  /**
   * Why the visitor cannot stay, or undefined while they can - including
   * while the answer is still loading, or the page sends itself away before
   * it knows whether it had to.
   */
  reason?: string;
  /** Where they end up instead. */
  to: string;
}

/**
 * Sends a visitor away from a page they may not see, and says why.
 *
 * `replace`, never `push`. A pushed redirect leaves the guarded page in the
 * history behind its own destination, so pressing back lands on it, it
 * redirects forward again, and the visitor is trapped between the two pages
 * with the same error repeating. Replacing drops the guarded entry, which
 * leaves back pointing at wherever they actually came from.
 *
 * Waits for the router. Every caller builds `to` from `router.query`, which is
 * empty until Next has parsed the URL, so redirecting before then would send
 * the visitor to /orgs/undefined.
 *
 * Fires once per mount: the page keeps rendering while the navigation is in
 * flight, and a second render must not repeat the message.
 */
export default function useRedirectWithReason({
  reason,
  to,
}: RedirectWithReason) {
  const router = useRouter();
  const { isReady } = router;
  const { addSnack } = useSnack();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || !reason || !isReady) {
      return;
    }

    hasRedirected.current = true;
    addSnack(reason, SnackTypes.ERROR);
    router.replace(to);
  }, [addSnack, isReady, reason, router, to]);
}

export interface AccessCheck {
  /** True when this particular check says the visitor cannot stay. */
  blocked: boolean;
  reason: string;
}

/**
 * The first reason the visitor cannot stay, once the page knows enough to say
 * one.
 *
 * Guards used to read half-loaded values and send people away before the
 * answer arrived, and each page spelled out its own "not while loading, and
 * not before the router is ready" dance. `settled` is that gate, stated once
 * per page; the checks are tried in order, so the most specific reason wins
 * over the generic one.
 */
export function blockingReason(
  settled: boolean,
  checks: AccessCheck[],
): string | undefined {
  if (!settled) {
    return undefined;
  }

  return checks.find((check) => check.blocked)?.reason;
}
