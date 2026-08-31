import type { RouteMatchCallbackOptions, RuntimeCaching } from "serwist";

const isSameOriginNonApiRequest = ({
  sameOrigin,
  url,
}: RouteMatchCallbackOptions) =>
  sameOrigin && !url.pathname.startsWith("/api/");

const matchesRoute = (
  matcher: RuntimeCaching["matcher"],
  options: RouteMatchCallbackOptions,
) => {
  if (typeof matcher === "string") {
    return options.url.href === new URL(matcher, location.href).href;
  }

  if (matcher instanceof RegExp) {
    return matcher.test(options.url.href);
  }

  return Boolean(matcher(options));
};

export const restrictToSameOriginNonApiRequests = (
  runtimeCaching: readonly RuntimeCaching[],
): RuntimeCaching[] =>
  runtimeCaching.map((entry) => ({
    ...entry,
    matcher: (options: RouteMatchCallbackOptions) =>
      isSameOriginNonApiRequest(options) &&
      matchesRoute(entry.matcher, options),
  }));
