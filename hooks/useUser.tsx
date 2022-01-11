import { useRouter } from "next/router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchUser, logout, refreshAccessToken } from "../services/auth";
import { User, UserContextType } from "../types/types";

const UserContext = createContext<UserContextType>({} as UserContextType);

// Export the provider as we need to wrap the entire app with it
export function UserProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    /* will attempt to fetch and set the user state */
    const checkAuth = async () => {
      const res = await fetchUser();

      /* query for a new token if inital request fails */
      if (!res.ok) {
        const refreshRes = await refreshAccessToken();
        if (refreshRes.ok) {
          /* new token should be received - try to fetch the user again */
          const user = await fetchUser().then((res) => res.json());
          setUser(user.user);
        } else {
          setError("Authentication failed");
        }
      } else {
        const user = await res.json();
        setUser(user.user);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /* will clear user state and request to remove the cookies */
  const logoutHandler = async () => {
    setUser(undefined);
    return logout();
  };

  const memoizedState = useMemo(
    () => ({
      user,
      loading,
      logout: logoutHandler,
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
