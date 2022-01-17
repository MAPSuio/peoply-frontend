import { useRouter } from "next/router";

const useHome = () => {
  const router = useRouter();

  return () => {
    router.push("/");
  };
};

export default useHome;
