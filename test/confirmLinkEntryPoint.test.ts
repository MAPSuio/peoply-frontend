import { describe, expect, it } from "vitest";
import { CONFIRM_LINK_PATHS, LINK_PATHS } from "../constants/providers";
import { LoginProvider } from "../types/types";

/**
 * The confirm button in the link modal must not go to the plain login entry
 * point. A plain login regenerates the session on the backend and drops the
 * parked link, which is what stops a planted session id from attaching an
 * identity to whoever logs in next.
 */
describe("link modal entry points", () => {
  it("confirms a parked link through its own backend door", () => {
    expect(CONFIRM_LINK_PATHS[LoginProvider.VIPPS]).toBe("/auth/confirm-link");
    expect(CONFIRM_LINK_PATHS[LoginProvider.GOOGLE]).toBe(
      "/auth/confirm-link/google",
    );
  });

  it("keeps the settings-initiated link separate from the confirm", () => {
    for (const provider of Object.values(LoginProvider)) {
      expect(CONFIRM_LINK_PATHS[provider]).not.toBe(LINK_PATHS[provider]);
    }
  });
});
