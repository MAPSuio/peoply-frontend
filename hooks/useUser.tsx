import {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ApiError } from "../services/apiError";
import { deleteMe, logout } from "../services/auth";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { fetchIpInfo } from "../services/ip";
import type {
  IpInfo,
  Organization,
  User,
  UserContextType,
} from "../types/types";

const UserContext = createContext<UserContextType>({} as UserContextType);

// Export the provider as we need to wrap the entire app with it
export function UserProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [user, setUser] = useState<User>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [reload, setReload] = useState(false);
  const [currentOrg, setCurrentOrg] = useState<Organization | undefined>(
    undefined,
  );
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [ipInfo, setIpInfo] = useState<IpInfo>();
  const authRetryAttempted = useRef(false);

  useEffect(() => {
    let active = true;

    const loadIpInfo = async () => {
      try {
        const ip = await fetchIpInfo();

        if (active && ip) {
          setIpInfo(ip);
        }
      } catch {
        // IP lookup is best-effort and should never affect auth bootstrap.
      }
    };

    void loadIpInfo();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    /* will attempt to fetch and set the user state */
    const checkAuth = async () => {
      try {
        // ask /me with no cache
        const user = await fetchFromPeoplyApiJson("/users/me", {
          headers: { "Cache-Control": "no-cache" },
        });

        if (!active) {
          return;
        }

        authRetryAttempted.current = false;
        setError(undefined);
        setUser(user);
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        const apiError = error instanceof ApiError ? error : undefined;

        if (apiError?.status === 401) {
          authRetryAttempted.current = false;
          setUser(undefined);
          setError("Unauthorized");
        } else {
          if (!authRetryAttempted.current) {
            authRetryAttempted.current = true;
            retryTimer = setTimeout(() => setReload((prev) => !prev), 1500);
            return;
          }

          setError("Could not verify auth state");
        }
      }
      setLoading(false);
    };

    checkAuth();

    return () => {
      active = false;
      clearTimeout(retryTimer);
    };
  }, [reload]);

  /* separate hook to fetch orgs independently of user */
  useEffect(() => {
    let active = true;

    if (user) {
      const fetchOrganizations = async () => {
        try {
          const organizations: Organization[] = await fetchFromPeoplyApiJson(
            `/users/${user.id}/organizations`,
          );

          if (!active) {
            return;
          }

          setOrgs(organizations);
          const currentOrg = getOrgContext();

          /* check if currentOrg from localstorage actually exists */
          if (
            currentOrg &&
            organizations.map((org) => org.id).includes(currentOrg.id)
          ) {
            const org = organizations.find((org) => org.id === currentOrg.id);
            switchContext(org);
            setCurrentOrg(org);
          }
        } catch (error) {
          if (active) {
            setError(error instanceof Error ? error.message : undefined);
          }
        }
      };

      fetchOrganizations();
    }

    return () => {
      active = false;
    };
  }, [user, reload]);

  /* will clear user state and request to remove the cookies */
  const logoutHandler = async () => {
    const response = await logout();
    setUser(undefined);
    return response;
  };

  const deleteMeHandler = async () => {
    const response = await deleteMe();
    setUser(undefined);
    return response;
  };

  /* will switch context to org if provided, otherwise switch to user */
  const switchContext = (org?: Organization) => {
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem("currentOrg", JSON.stringify(org));
    } else {
      setCurrentOrg(undefined);
      localStorage.removeItem("currentOrg");
    }
  };

  const getOrgContext = () => {
    const org = localStorage.getItem("currentOrg");
    if (org) {
      return JSON.parse(org);
    }
    return undefined;
  };

  const memoizedState = useMemo(
    () => ({
      user,
      loading,
      logout: logoutHandler,
      deleteMe: deleteMeHandler,
      error,
      currentOrg,
      orgs,
      switchContext,
      reload: () => setReload(!reload),
      ipInfo,
    }),
    [user, loading, error, currentOrg, orgs, ipInfo, reload],
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
