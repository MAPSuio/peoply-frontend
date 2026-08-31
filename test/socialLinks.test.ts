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

  it("drops a javascript: url before it reaches an href", () => {
    const links = getOrganizationSocialLinks(
      orgWith({ websiteUrl: "javascript:alert(document.domain)" }),
    );
    expect(links.some((link) => link.url.startsWith("javascript:"))).toBe(
      false,
    );
  });
});
