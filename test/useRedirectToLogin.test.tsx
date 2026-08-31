import { render } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useRedirectToLogin from "../hooks/useRedirectToLogin";

const push = vi.fn();
const replace = vi.fn();
const router = { push, replace, asPath: "/orgs/ificreatorsguild/members" };

vi.mock("next/router", () => ({ useRouter: () => router }));

function SignedOutPage() {
  const redirectToLogin = useRedirectToLogin();

  useEffect(() => {
    redirectToLogin();
  }, [redirectToLogin]);

  return <p>krever innlogging</p>;
}

describe("useRedirectToLogin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("carries the way back to the page the visitor asked for", () => {
    render(<SignedOutPage />);

    expect(push).toHaveBeenCalledWith(
      "/login?redirect=/orgs/ificreatorsguild/members",
    );
  });

  it("keeps its identity across renders, so a guard effect fires once", () => {
    const { rerender } = render(<SignedOutPage />);
    rerender(<SignedOutPage />);
    rerender(<SignedOutPage />);

    expect(push).toHaveBeenCalledOnce();
  });
});
