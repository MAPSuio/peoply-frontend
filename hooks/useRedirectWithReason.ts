import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

import { SnackTypes } from "../types/types";
import useSnack from "./useSnack";

interface RedirectWithReason {
  /**
   * True once it is settled that the visitor cannot stay - never while the
   * answer is still loading, or a page redirects itself away before it knows
   * whether it had to.
   */
  when: boolean;
  /** What the visitor is told, in their own language. */
  reason: string;
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
 * Fires once per mount: the page keeps rendering while the navigation is in
 * flight, and a second render must not repeat the message.
 */
export default function useRedirectWithReason({
  when,
  reason,
  to,
}: RedirectWithReason) {
  const router = useRouter();
  const { addSnack } = useSnack();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current || !when) {
      return;
    }

    hasRedirected.current = true;
    addSnack(reason, SnackTypes.ERROR);
    router.replace(to);
  }, [addSnack, reason, router, to, when]);
}
