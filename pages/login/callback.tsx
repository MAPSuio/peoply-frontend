import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toSafeRedirectPath } from "../../utils/redirect";

const LoginCallback: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectURL = localStorage.getItem("redirectURL");
    localStorage.removeItem("redirectURL");
    // Checked again on the way out as well as on the way in: localStorage is
    // writable by anything running in this origin, and router.push turns a
    // value with a scheme into window.location.href = value.
    router.push(toSafeRedirectPath(redirectURL));
  }, [router]);
  return <></>;
};

export default LoginCallback;
