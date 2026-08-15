import { describe, expect, it } from "vitest";
import type { User } from "../types/types";
import { isAdmin } from "../utils/admin";

describe("isAdmin", () => {
  it("uses the server-provided admin permission", () => {
    expect(isAdmin({ isAdmin: true } as User)).toBe(true);
    expect(isAdmin({ isAdmin: false } as User)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
