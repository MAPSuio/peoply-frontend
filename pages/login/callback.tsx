import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const LoginCallback: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectURL = localStorage.getItem("redirectURL");
    if (redirectURL) {
      localStorage.removeItem("redirectURL");
      router.push(redirectURL);
    } else {
      router.push("/");
    }
  }, [router]);
  return <></>;
};

export default LoginCallback;
