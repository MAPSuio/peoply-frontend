import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useRedirectToLogin from "../hooks/useRedirectToLogin";

const push = vi.fn();
let asPath = "/orgs/ificreatorsguild/members";
const router = {
  push,
  replace: vi.fn(),
  get asPath() {
    return asPath;
  },
};

vi.mock("next/router", () => ({ useRouter: () => router }));

/* The shape almost every guarded page uses: decide during render that the
   visitor is not signed in, and send them to login on the spot. */
function GuardedPage() {
  const redirectToLogin = useRedirectToLogin();

  redirectToLogin();

  return <p>krever innlogging</p>;
}

function FollowButton() {
  const redirectToLogin = useRedirectToLogin();

  return (
    <button type="button" onClick={redirectToLogin}>
      Følg
    </button>
  );
}

describe("useRedirectToLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    asPath = "/orgs/ificreatorsguild/members";
  });

  it("carries the way back to the page the visitor asked for", () => {
    render(<GuardedPage />);

    expect(push).toHaveBeenCalledWith(
      "/login?redirect=%2Forgs%2Fificreatorsguild%2Fmembers",
    );
  });

  it("keeps a return path that has query parameters of its own", () => {
    asPath = "/events?tab=kommende&sted=oslo";

    render(<GuardedPage />);

    expect(push).toHaveBeenCalledWith(
      "/login?redirect=%2Fevents%3Ftab%3Dkommende%26sted%3Doslo",
    );
  });

  it("sends a guarded page to login once, however often it rerenders", () => {
    const { rerender } = render(<GuardedPage />);
    rerender(<GuardedPage />);
    rerender(<GuardedPage />);

    expect(push).toHaveBeenCalledOnce();
  });

  it("does not queue a second login navigation on a second click", async () => {
    render(<FollowButton />);
    const button = document.querySelector("button") as HTMLButtonElement;

    await userEvent.click(button);
    await userEvent.click(button);

    expect(push).toHaveBeenCalledOnce();
  });
});
