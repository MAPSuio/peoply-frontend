import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useRedirectWithReason from "../hooks/useRedirectWithReason";
import { SnackTypes } from "../types/types";

const push = vi.fn();
const replace = vi.fn();
const addSnack = vi.fn();

const router = { push, replace, back: vi.fn(), query: {} };

vi.mock("next/router", () => ({ useRouter: () => router }));
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));

function Guarded({ when }: { when: boolean }) {
  useRedirectWithReason({
    when,
    reason: "Bare medlemmer kan se medlemslisten",
    to: "/orgs/ificreatorsguild",
  });
  return <p>medlemsliste</p>;
}

describe("useRedirectWithReason", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stays put while the condition is not met", () => {
    render(<Guarded when={false} />);

    expect(replace).not.toHaveBeenCalled();
    expect(addSnack).not.toHaveBeenCalled();
  });

  it("replaces the current entry so back does not land here again", () => {
    render(<Guarded when={true} />);

    expect(replace).toHaveBeenCalledWith("/orgs/ificreatorsguild");
    expect(push).not.toHaveBeenCalled();
    expect(addSnack).toHaveBeenCalledWith(
      "Bare medlemmer kan se medlemslisten",
      SnackTypes.ERROR,
    );
  });

  it("redirects once even though the page stays mounted while it navigates", () => {
    const { rerender } = render(<Guarded when={false} />);
    rerender(<Guarded when={true} />);
    rerender(<Guarded when={true} />);

    expect(replace).toHaveBeenCalledOnce();
    expect(addSnack).toHaveBeenCalledOnce();
  });
});
