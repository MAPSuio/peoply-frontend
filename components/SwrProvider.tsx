import { type ReactNode, useMemo } from "react";
import { SWRConfig } from "swr";
import useSnack from "../hooks/useSnack";
import { ApiError } from "../services/apiError";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { SnackTypes } from "../types/types";

/**
 * Application-wide SWR defaults.
 *
 * Supplies the fetcher every call site used to pass by hand, and gives the app
 * a single place where a failed request turns into user-visible feedback.
 * Must sit inside SnackbarProvider so it can reach addSnack.
 */
export default function SwrProvider({ children }: { children: ReactNode }) {
  const { addSnack } = useSnack();

  const value = useMemo(
    () => ({
      fetcher: fetchFromPeoplyApiJson,

      // Bound the retry sequence. SWR's default keeps retrying with
      // exponential backoff, which on a hard outage means a request per tab
      // forever.
      errorRetryCount: 3,

      onError: (error: unknown) => {
        const status = error instanceof ApiError ? error.status : undefined;

        // 401/403 are handled by the auth flow - surfacing them here would
        // snack on every page a logged-out visitor opens. 404 is a legitimate
        // answer for pages that probe for a resource that may not exist.
        if (status === 401 || status === 403 || status === 404) return;

        addSnack("Noe gikk galt. Prøv igjen om litt.", SnackTypes.ERROR);
      },
    }),
    [addSnack],
  );

  return <SWRConfig value={value}>{children}</SWRConfig>;
}
