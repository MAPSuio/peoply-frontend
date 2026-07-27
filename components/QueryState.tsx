import type { ReactNode } from "react";
import Button from "./Button";
import LoadingWheel from "./LoadingWheel";
import { ButtonSize, ButtonType } from "../types/types";
import cx from "../utils/cx";
import styles from "../styles/QueryState.module.scss";

const DEFAULT_ERROR_MESSAGE = "Kunne ikke hente dataen. Prøv igjen om litt.";

/**
 * The shape every call site already has from `useSWR` - either its return
 * value verbatim, or a hand-picked subset of it. Kept minimal and structural
 * on purpose: an `SWRResponse<T>` satisfies this without a cast, and so does
 * a plain `{ data, error }` object literal built from several hooks.
 */
export interface QueryLike<T> {
  data: T | undefined;
  error?: unknown;
  isLoading?: boolean;
  /** Enables the retry button on the error state. Omit it to hide the button. */
  mutate?: () => unknown;
}

interface QueryStateProps<T> {
  query: QueryLike<T>;
  /** Overrides the standard Norwegian error message for this call site. */
  errorMessage?: string;
  /** Extra class on the error card - e.g. to match a page's own width cap. */
  className?: string;
  /** Rendered once data has arrived. */
  children: (data: T) => ReactNode;
}

/**
 * Collapses the loading/error/data-ready branches most SWR-backed pages used
 * to hand-roll into one place: `LoadingWheel` while nothing has arrived yet,
 * a Norwegian error message (with a retry button when `mutate` is supplied)
 * once the request fails, and the render prop once data is in.
 *
 * Not for pages with a genuinely bespoke shape - skeletons, section-by-section
 * partial rendering, or several independent queries that don't share one
 * loading/error gate. See CONTRIBUTING.md ("Data fetching") for which pages
 * qualify and why.
 */
export default function QueryState<T>({
  query,
  errorMessage = DEFAULT_ERROR_MESSAGE,
  className,
  children,
}: QueryStateProps<T>) {
  const { data, error, isLoading, mutate } = query;

  if (error) {
    return (
      <div className={cx(styles.error, className)} role="alert">
        <p>{errorMessage}</p>
        {mutate && (
          <Button
            text="Prøv igjen"
            type={ButtonType.SECONDARY}
            size={ButtonSize.SMALL}
            onClick={() => mutate()}
          />
        )}
      </div>
    );
  }

  // A request still in flight is not the same as "no data" - but a disabled
  // query (`isLoading` false, `data` still undefined because the key is
  // null) is not "ready" either, so it falls back to the spinner rather than
  // calling `children` with an argument it isn't typed to accept.
  if (isLoading || data === undefined) {
    return <LoadingWheel />;
  }

  return <>{children(data)}</>;
}
