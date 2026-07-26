import { useRouter } from "next/router";

const useRedirectToLogin = () => {
  const router = useRouter();
  const redirectToLogin = () => {
    router.push(`/login?redirect=${router.asPath}`);
  };
  return redirectToLogin;
};

export default useRedirectToLogin;
