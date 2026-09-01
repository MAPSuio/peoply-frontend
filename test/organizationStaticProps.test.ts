import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/organizations", () => ({
  getOrganization: vi.fn(),
}));

import { getOrganization } from "../services/organizations";
import { getOrganizationStaticProps } from "../utils/organization";

interface StaticPropsResult {
  props?: { organization: unknown };
  revalidate?: number;
  notFound?: boolean;
}

const props = (oid: string) =>
  getOrganizationStaticProps({
    params: { oid },
  } as never) as Promise<StaticPropsResult>;

const APPROVED = { id: "org-1", urlId: "maps", name: "MAPS" };

describe("getOrganizationStaticProps", () => {
  beforeEach(() => {
    vi.mocked(getOrganization).mockReset();
  });

  it("prerenders an organization anyone may see", async () => {
    vi.mocked(getOrganization).mockResolvedValue(APPROVED as never);

    const result = await props("maps");

    expect(result.props?.organization).toEqual(APPROVED);
    expect(result.revalidate).toBeGreaterThan(0);
  });

  /**
   * The prerender runs on the server without the visitor's cookies, so an
   * organization only its members may see is indistinguishable from one that
   * does not exist. Answering `notFound` here would lock a founder out of the
   * organization they just created, because every members-only view hangs off
   * this page. The page is handed nothing instead and asks again from the
   * browser, where the cookie exists.
   */
  it("hands the page nothing rather than a 404 when the server may not see it", async () => {
    vi.mocked(getOrganization).mockRejectedValue(new Error("404"));

    const result = await props("pending-org");

    expect(result.notFound).toBeUndefined();
    expect(result.props?.organization).toBeNull();
  });

  /**
   * And it has to expire. `fallback: "blocking"` caches what this returns, so
   * without a revalidate the answer given before moderation approved an
   * organization would outlive the approval.
   */
  it("lets that answer expire, so approval takes effect without a deploy", async () => {
    vi.mocked(getOrganization).mockRejectedValue(new Error("404"));

    const result = await props("pending-org");

    expect(result.revalidate).toBeGreaterThan(0);
  });

  it("still refuses a ref that cannot name an organization", async () => {
    const result = await props("../../admin");

    expect(result.notFound).toBe(true);
    expect(getOrganization).not.toHaveBeenCalled();
  });
});
