import useSWR from "swr";
import fetcher from "./fetcher";
import { logout } from "../services/auth";

function useUser() {
  const { data, mutate, error } = useSWR(`/auth/user`, fetcher);

  return {
    user: data?.user ? data.user : undefined,
    mutate,
    logout,
    isLoading: !error && !data,
    isError: error,
  };
}

export default useUser;
