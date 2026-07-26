import { useRouter } from "next/router";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { ButtonType } from "../types/types";
import Button from "./Button";
import styles from "../styles/ErrorBoundary.module.scss";

interface ErrorBoundaryClassProps {
  children: ReactNode;
}

interface ErrorBoundaryClassState {
  hasError: boolean;
}

/**
 * Last-resort fallback for render errors React itself can't recover from.
 * Only a class component can implement getDerivedStateFromError /
 * componentDidCatch - there is no hook equivalent.
 */
class ErrorBoundaryClass extends Component<
  ErrorBoundaryClassProps,
  ErrorBoundaryClassState
> {
  state: ErrorBoundaryClassState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryClassState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Ufanget feil i grensesnittet:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <h1>Oisann, noe gikk galt</h1>
            <p>
              Det oppstod en uventet feil. Prøv å laste inn siden på nytt - om
              feilen vedvarer, prøv igjen om litt.
            </p>
            <Button
              text="Last inn siden på nytt"
              onClick={this.handleReload}
              type={ButtonType.SECONDARY}
              className={styles.reloadButton}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wraps the class boundary above and remounts it on every completed route
 * change, so a crash on one page clears itself on navigation instead of
 * bricking the rest of the app - error boundaries don't reset their own
 * state, and keying on the pathname alone would miss navigation between two
 * dynamic routes that share the same pattern (e.g. /events/[eid] -> a
 * different event).
 */
export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const handleRouteChangeComplete = () => setResetKey((key) => key + 1);

    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router.events]);

  return <ErrorBoundaryClass key={resetKey}>{children}</ErrorBoundaryClass>;
}
