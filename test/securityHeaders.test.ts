import { describe, expect, it } from "vitest";
import nextConfig from "../next.config.js";

const UNRECOGNISED_PERMISSIONS_POLICY_FEATURES = [
  "attribution-reporting",
  "interest-cohort",
];

async function headersForEveryRoute() {
  const rules = await nextConfig.headers();
  const catchAllRule = rules.find((rule) => rule.source === "/:path*");

  if (!catchAllRule) {
    throw new Error("no catch-all header rule");
  }

  return Object.fromEntries(
    catchAllRule.headers.map(({ key, value }) => [key, value]),
  );
}

describe("security headers", () => {
  it("sends HSTS covering the api subdomain", async () => {
    const headers = await headersForEveryRoute();

    expect(headers["Strict-Transport-Security"]).toBe(
      "max-age=31536000; includeSubDomains",
    );
  });

  it("stops content sniffing, referrer leakage and framing", async () => {
    const headers = await headersForEveryRoute();

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy"]).toBe("frame-ancestors 'none'");
  });

  it("denies the powerful features the app never uses", async () => {
    const headers = await headersForEveryRoute();

    expect(headers["Permissions-Policy"]).toBe(
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
  });

  it("omits features browsers no longer recognise", async () => {
    const headers = await headersForEveryRoute();

    for (const feature of UNRECOGNISED_PERMISSIONS_POLICY_FEATURES) {
      expect(headers["Permissions-Policy"]).not.toContain(feature);
    }
  });
});
