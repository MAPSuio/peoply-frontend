import { LoginProvider } from "../types/types";

export const PROVIDER_NAMES: Record<LoginProvider, string> = {
  [LoginProvider.VIPPS]: "Vipps",
  [LoginProvider.GOOGLE]: "Google",
};

/** Backend entry points that start a plain OIDC login. */
export const LOGIN_PATHS: Record<LoginProvider, string> = {
  [LoginProvider.VIPPS]: "/auth/login",
  [LoginProvider.GOOGLE]: "/auth/login/google",
};

/** Backend entry points that link the provider to the logged-in user. */
export const LINK_PATHS: Record<LoginProvider, string> = {
  [LoginProvider.VIPPS]: "/auth/link",
  [LoginProvider.GOOGLE]: "/auth/link/google",
};

export const isLoginProvider = (value: string): value is LoginProvider =>
  value in PROVIDER_NAMES;
