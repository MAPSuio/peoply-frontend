import { useEffect, useState } from "react";
import { fetchIpInfo } from "../services/ip";

export function useIP() {
  const [ipInfo, setIpInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    fetchIpInfo().then((data) => {
      if (data) setIpInfo(data);
      else setError({ message: "Error fetching IP info" });
      setLoading(false);
    });
  }, []);
  return { loading, ipInfo, error };
}
