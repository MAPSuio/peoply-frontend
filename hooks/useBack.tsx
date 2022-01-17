import { useRouter } from "next/router";

const useBack = () => {
  const router = useRouter();

  return () => {
    router.back();
  };
};

export default useBack;
