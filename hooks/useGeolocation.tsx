import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getGeolocation } from "../services/geolocation";
import {
  GeolocationContextType,
  GeolocationPostitionObject,
} from "../types/types";

const GeolocationContext = createContext<GeolocationContextType>(
  {} as GeolocationContextType,
);

interface GeolocationProviderOptions {
  usingLocalStorage?: {
    localStorageTimeoutMinutes: number;
  };
}

export function GeolocationProvider({
  children,
  options = {
    usingLocalStorage: {
      localStorageTimeoutMinutes: 5,
    },
  },
}: {
  children: ReactNode;
  options?: GeolocationProviderOptions;
}) {
  const [geolocation, setGeolocation] = useState<GeolocationPosition>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [activated, setActivated] = useState<boolean>();

  const activate = () => {
    if (!activated) {
      localStorage.setItem("geolocation_activated", "true");
      setActivated(true);
    }
  };

  useEffect(() => {
    const activatedLocal =
      localStorage.getItem("geolocation_activated") === "true";
    if (activatedLocal && !activated) {
      setActivated(true);
      return;
    }

    const fetchGeolocation = async () => {
      try {
        const geolocation = await getGeolocation();
        setGeolocation(geolocation);
        setError(undefined);

        if (options.usingLocalStorage) {
          localStorage.setItem(
            "geolocation",
            JSON.stringify({
              coords: {
                latitude: geolocation.coords.latitude,
                longitude: geolocation.coords.longitude,
                accuracy: geolocation.coords.accuracy,
                altitude: geolocation.coords.altitude,
                altitudeAccuracy: geolocation.coords.altitudeAccuracy,
                heading: geolocation.coords.heading,
                speed: geolocation.coords.speed,
              },
              timestamp: geolocation.timestamp,
            }),
          );
        }
      } catch (error) {
        localStorage.setItem("geolocation_activated", "false");
        setActivated(false);
        setError("Error fetching geolocation");
      }
      setLoading(false);
    };

    const fetchGeolocationHandler = async () => {
      setLoading(true);
      if (options.usingLocalStorage) {
        const localGeolocationString = localStorage.getItem("geolocation");
        if (localGeolocationString) {
          const localGeolocation: GeolocationPostitionObject = JSON.parse(
            localGeolocationString,
          );

          /* if localGeolocation.timpestamp is newer than sepcified, use that  */
          if (
            new Date().getTime() - localGeolocation.timestamp <
            options.usingLocalStorage.localStorageTimeoutMinutes * 60 * 1000
          ) {
            setGeolocation(localGeolocation);
            setLoading(false);
            return;
          }
        }
      }
      fetchGeolocation();
    };

    if (activatedLocal) {
      fetchGeolocationHandler();
    }
  }, [activated, options.usingLocalStorage]);

  return (
    <GeolocationContext.Provider
      value={{
        loading,
        geolocation,
        error,
        activateGeolocation: activate,
        activated,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation() {
  return useContext(GeolocationContext);
}
