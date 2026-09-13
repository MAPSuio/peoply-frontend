import { type ReactElement, useEffect } from "react";

import useRedirectToLogin from "../hooks/useRedirectToLogin";
import useUser from "../hooks/useUser";
import type { User } from "../types/types";

export interface RequireUserProps {
  children: (user: User) => ReactElement | null;
}

export default function RequireUser({ children }: RequireUserProps) {
  const { user, loading } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const signedOut = !loading && !user;

  useEffect(() => {
    if (signedOut) {
      redirectToLogin();
    }
  }, [signedOut, redirectToLogin]);

  if (loading || !user) {
    return null;
  }

  return children(user);
}
