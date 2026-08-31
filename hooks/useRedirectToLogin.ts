import { useRouter } from "next/router";
import { useCallback } from "react";

/**
 * Sends a signed-out visitor to the login page, with the way back.
 *
 * Memoised: callers put this in a guard effect's dependency list, and a fresh
 * function on every render re-ran the effect and pushed another login entry
 * on every render after that.
 */
const useRedirectToLogin = () => {
  const router = useRouter();
  const { asPath, push } = router;

  return useCallback(() => {
    push(`/login?redirect=${asPath}`);
  }, [asPath, push]);
};

export default useRedirectToLogin;
