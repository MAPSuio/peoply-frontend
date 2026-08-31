import { useRouter } from "next/router";
import { useCallback, useRef } from "react";

/**
 * Sends a signed-out visitor to the login page, with the way back.
 *
 * Navigates once per mount. Most guarded pages call this straight from their
 * render path, so without the guard every rerender before the navigation
 * settled pushed another login entry, and the visitor had to press back as
 * many times as the page happened to render.
 *
 * The return path is encoded: it is a whole path with its own query string,
 * and interpolating it raw made everything after its first `&` a parameter of
 * the login URL instead of part of where the visitor was going.
 */
const useRedirectToLogin = () => {
  const router = useRouter();
  const { asPath, push } = router;
  const hasRedirected = useRef(false);

  return useCallback(() => {
    if (hasRedirected.current) {
      return;
    }

    hasRedirected.current = true;
    push(`/login?${new URLSearchParams({ redirect: asPath })}`);
  }, [asPath, push]);
};

export default useRedirectToLogin;
