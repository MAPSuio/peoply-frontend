import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { deleteMe, logout } from "../services/auth";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { fetchIpInfo } from "../services/ip";
import { IpInfo, Organization, User, UserContextType } from "../types/types";

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
  const [reload, setReload] = useState(false);
  const [currentOrg, setCurrentOrg] = useState<Organization | undefined>(
    undefined,
  );
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [ipInfo, setIpInfo] = useState<IpInfo>();

  useEffect(() => {
    fetchIpInfo().then((ip) => {
      if (ip) setIpInfo(ip);
    });
  }, []);

  useEffect(() => {
    /* will attempt to fetch and set the user state */
    const checkAuth = async () => {
      try {
        // ask /me with no cache
        const user = await fetchFromPeoplyApiJson("/users/me", {
          headers: { "Cache-Control": "no-cache" },
        });
        setError(undefined);
        setUser(user);
      } catch (error: unknown) {
        const response = error as Response;

        if (response?.status === 401) {
          setUser(undefined);
          setError("Unauthorized");
        } else {
          setError("Could not verify auth state");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [reload]);

  /* separate hook to fetch orgs independently of user */
  useEffect(() => {
    if (user) {
      const fetchOrganizations = async () => {
        try {
          const organizations: Organization[] = await fetchFromPeoplyApiJson(
            `/users/${user.id}/organizations`,
          );
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
        } catch (error: any) {
          setError(error.message);
        }
      };

      fetchOrganizations();
    }
  }, [user, reload]);

  /* will clear user state and request to remove the cookies */
  const logoutHandler = async () => {
    setUser(undefined);
    return logout();
  };

  const deleteMeHandler = async () => {
    setUser(undefined);
    return deleteMe();
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
