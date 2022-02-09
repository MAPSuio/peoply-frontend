import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { clearTimeout, setTimeout } from "timers";
import Snackbar from "../components/Snackbar";
import { SnackContextType, Snack, SnackTypes } from "../types/types";

const SnackbarContext = createContext<SnackContextType>({} as SnackContextType);

const SNACK_DURATION = 3000;

export function SnackbarProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [snacks, setSnacks] = useState<Snack[]>([]);

  useEffect(() => {
    if (snacks.length > 0) {
      const timer = setTimeout(
        () => setSnacks((snacks) => snacks.slice(0, snacks.length - 1)),
        SNACK_DURATION,
      );
      return () => clearTimeout(timer);
    }
  });

  const addSnack = useCallback(
    (label: string, type?: SnackTypes) =>
      setSnacks((snacks) => [{ label: label, type: type }, ...snacks]),
    [],
  );

  const value = useMemo(() => ({ addSnack }), [addSnack]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {snacks.map((snack: Snack, index: number) => (
        <Snackbar
          key={snack.label}
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
