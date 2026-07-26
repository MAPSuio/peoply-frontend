import {
  createContext,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Snackbar from "../components/Snackbar";
import type { SnackContextType, Snack, SnackTypes } from "../types/types";
import { generateRandomKey } from "../utils/functions";

const SnackbarContext = createContext<SnackContextType>({} as SnackContextType);

const SNACK_DURATION = 3000;

export function SnackbarProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [snacks, setSnacks] = useState<Snack[]>([]);

  /* Depends on `snacks` rather than running after every render: this provider
     wraps the whole app, so an unrelated re-render used to restart the timer
     and a snackbar could stay on screen indefinitely. */
  useEffect(() => {
    if (snacks.length === 0) {
      return;
    }

    const timer = setTimeout(
      () => setSnacks((snacks) => snacks.slice(0, snacks.length - 1)),
      SNACK_DURATION,
    );

    return () => clearTimeout(timer);
  }, [snacks]);

  const addSnack = useCallback(
    (label: string, type?: SnackTypes) =>
      setSnacks((_snacks) => [{ label: label, type: type } /* , ...snacks */]),
    [],
  );

  const value = useMemo(() => ({ addSnack }), [addSnack]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {snacks.map((snack: Snack, index: number) => (
        <Snackbar
          key={generateRandomKey()}
          label={snack.label}
          type={snack.type}
          first={index === 0}
        />
      ))}
    </SnackbarContext.Provider>
  );
}

/* For use in components. */
export default function useSnack() {
  return useContext(SnackbarContext);
}
