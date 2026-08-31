import { describe, expect, it } from "vitest";
import { getOrganizationSocialLinks } from "../utils/socialLinks";
import type { Organization } from "../types/types";

const orgWith = (overrides: Partial<Organization>): Organization =>
  ({ id: "org-1", name: "CYB", ...overrides }) as Organization;

describe("getOrganizationSocialLinks", () => {
  it("keeps a normal https link", () => {
    const links = getOrganizationSocialLinks(
      orgWith({ websiteUrl: "https://cyb.no" }),
    );
    expect(links.map((link) => link.url)).toContain("https://cyb.no");
  });

  const urlsOutsideTheHttpAllowlist = [
    "javascript:alert(document.domain)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ];

  it.each(urlsOutsideTheHttpAllowlist)(
    "drops %s before it reaches an href",
    (websiteUrl) => {
      expect(getOrganizationSocialLinks(orgWith({ websiteUrl }))).toEqual([]);
    },
  );
});
