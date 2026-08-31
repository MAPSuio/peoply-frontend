import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useRedirectWithReason, {
  blockingReason,
} from "../hooks/useRedirectWithReason";
import { SnackTypes } from "../types/types";

const push = vi.fn();
const replace = vi.fn();
const addSnack = vi.fn();

let routerReady = true;
const router = {
  push,
  replace,
  back: vi.fn(),
  query: {},
  get isReady() {
    return routerReady;
  },
};

vi.mock("next/router", () => ({ useRouter: () => router }));
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));

function Guarded({ blocked }: { blocked: boolean }) {
  useRedirectWithReason({
    reason: blocked ? "Bare medlemmer kan se medlemslisten" : undefined,
    to: "/orgs/ificreatorsguild",
  });
  return <p>medlemsliste</p>;
}

describe("useRedirectWithReason", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    routerReady = true;
  });

  it("stays put while there is no reason to leave", () => {
    render(<Guarded blocked={false} />);

    expect(replace).not.toHaveBeenCalled();
    expect(addSnack).not.toHaveBeenCalled();
  });

  it("replaces the current entry so back does not land here again", () => {
    render(<Guarded blocked={true} />);

    expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild");
    expect(push).not.toHaveBeenCalled();
    expect(addSnack).toHaveBeenCalledWith(
      "Bare medlemmer kan se medlemslisten",
      SnackTypes.ERROR,
    );
  });

  it("waits for the router, so it never redirects to an unparsed URL", () => {
    routerReady = false;
    const { rerender } = render(<Guarded blocked={true} />);

    expect(replace).not.toHaveBeenCalled();

    routerReady = true;
    rerender(<Guarded blocked={true} />);

    expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild");
  });

  it("redirects once even though the page stays mounted while it navigates", () => {
    const { rerender } = render(<Guarded blocked={false} />);
    rerender(<Guarded blocked={true} />);
    rerender(<Guarded blocked={true} />);

    expect(replace).toHaveBeenCalledOnce();
    expect(addSnack).toHaveBeenCalledOnce();
  });
});

describe("blockingReason", () => {
  const CHECKS = [
    { blocked: false, reason: "spesifikk" },
    { blocked: true, reason: "generell" },
  ];

  it("says nothing while the page is still loading its answer", () => {
    expect(blockingReason(false, CHECKS)).toBeUndefined();
  });

  it("gives the first reason that applies, not the last", () => {
    expect(
      blockingReason(true, [{ blocked: true, reason: "spesifikk" }, ...CHECKS]),
    ).toBe("spesifikk");
  });

  it("falls through to the general reason", () => {
    expect(blockingReason(true, CHECKS)).toBe("generell");
  });

  it("says nothing when every check passes", () => {
    expect(
      blockingReason(true, [{ blocked: false, reason: "generell" }]),
    ).toBeUndefined();
  });
});
