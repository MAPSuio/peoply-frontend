import { useRouter } from "next/router";

const useBack = (fallbackUrl?: string) => {
  const router = useRouter();

  return () => {
    if (history.length > 2) router.back();
    else if (fallbackUrl) router.push(fallbackUrl);
    else router.push("/");
  };
};

export default useBack;
