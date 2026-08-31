import type { ComponentType } from "react";
import GoogleLogo from "../components/svgs/GoogleLogo";
import VippsLogo from "../components/svgs/VippsLogo";
import { LoginProvider } from "../types/types";

export const PROVIDER_NAMES: Record<LoginProvider, string> = {
  [LoginProvider.VIPPS]: "Vipps",
  [LoginProvider.GOOGLE]: "Google",
};

export const PROVIDER_LOGOS: Record<
  LoginProvider,
  ComponentType<{ className?: string }>
> = {
  [LoginProvider.VIPPS]: VippsLogo,
  [LoginProvider.GOOGLE]: GoogleLogo,
};

/** Backend entry points that confirm a link parked by an email collision. */
export const CONFIRM_LINK_PATHS: Record<LoginProvider, string> = {
  [LoginProvider.VIPPS]: "/auth/confirm-link",
  [LoginProvider.GOOGLE]: "/auth/confirm-link/google",
};

/** Backend entry points that link the provider to the logged-in user. */
export const LINK_PATHS: Record<LoginProvider, string> = {
  [LoginProvider.VIPPS]: "/auth/link",
  [LoginProvider.GOOGLE]: "/auth/link/google",
};

export const isLoginProvider = (value: string): value is LoginProvider =>
  // Object.hasOwn, not `in`: this guards URL-controlled input, and `in`
  // walks the prototype chain — isLoginProvider("toString") must be false.
  Object.hasOwn(PROVIDER_NAMES, value);
