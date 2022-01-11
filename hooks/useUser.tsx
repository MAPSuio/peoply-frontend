import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchUser, refreshAccessToken } from "../services/auth";

interface UserContextType {
  user?: {
    first_name: string;
    last_name: string;
    birth_date: string;
    user_id: string;
    arranger_id: string;
    phone: string;
    image?: string;
  };
  loading: boolean;
  error?: string;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

// Export the provider as we need to wrap the entire app with it
export function UserProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    /* will attempt to fetch and set the user state */
    const checkAuth = async () => {
      const res = await fetchUser();

      /* query for a new token if inital request fails */
      if (!res.ok) {
        const refreshRes = await refreshAccessToken();
        if (refreshRes.ok) {
          /* new token should be received - try to fetch the user again */
          const user = await fetchUser().then((res) => res.json());
          setUser(user);
        } else {
          setError("Authentication failed");
        }
      } else {
        const user = await res.json();
        setUser(user);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const memoizedState = useMemo(
    () => ({
      user,
      loading,
      error,
    }),
    [user, loading, error],
  );

  return (
    <UserContext.Provider value={memoizedState}>
      {children}
    </UserContext.Provider>
  );
}

/* for use in components */
export default function useUser() {
  return useContext(UserContext);
}
