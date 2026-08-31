import { describe, expect, it } from "vitest";
import { isValidApiRef, isValidUuid } from "../utils/apiPathParams";

describe("isValidUuid", () => {
  it("accepts a v4 UUID", () => {
    expect(isValidUuid("a229661b-1111-4111-8111-111111111111")).toBe(true);
  });

  it.each([
    "..%2F..%2Fadmin",
    "../../admin",
    "a229661b-1111-4111-8111-111111111111/registrations",
    "not-a-uuid",
    "",
  ])("rejects %p", (value) => {
    expect(isValidUuid(value)).toBe(false);
  });
});

describe("isValidApiRef", () => {
  it.each(["ifi-cyb", "a229661b-1111-4111-8111-111111111111", "CYB"])(
    "accepts the ref %p",
    (value) => {
      expect(isValidApiRef(value)).toBe(true);
    },
  );

  it.each(["../../admin", "a/b", "a.b", "a b", ""])(
    "rejects a ref that could traverse: %p",
    (value) => {
      expect(isValidApiRef(value)).toBe(false);
    },
  );
});
