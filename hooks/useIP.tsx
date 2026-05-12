import { useEffect, useState } from "react";
import { fetchIpInfo } from "../services/ip";

export function useIP() {
  const [ipInfo, setIpInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let active = true;

    const loadIpInfo = async () => {
      try {
        const data = await fetchIpInfo();

        if (!active) {
          return;
        }

        if (data) {
          setIpInfo(data);
        } else {
          setError({ message: "Error fetching IP info" });
        }
      } catch {
        if (active) {
          setError({ message: "Error fetching IP info" });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadIpInfo();

    return () => {
      active = false;
    };
  }, []);
  return { loading, ipInfo, error };
}
