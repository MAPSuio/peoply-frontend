import { describe, expect, it } from "vitest";

import { isValidEventId } from "../utils/eventId";

describe("isValidEventId", () => {
  it("accepts generated urlIds", () => {
    expect(isValidEventId("ABCDEFGH")).toBe(true);
    expect(isValidEventId("abcdefgh")).toBe(true);
  });

  it("accepts event UUIDs", () => {
    expect(isValidEventId("3f2b8c1a-4d5e-4f6a-8b9c-0d1e2f3a4b5c")).toBe(true);
  });

  it("rejects values that could steer the API request elsewhere", () => {
    expect(isValidEventId("../auth/refresh")).toBe(false);
    expect(isValidEventId("..%2f..%2fusers")).toBe(false);
    expect(isValidEventId("ABCDEFGH/../../users")).toBe(false);
    expect(isValidEventId("ABCDEFGH?x=1")).toBe(false);
    expect(isValidEventId("ABCDEFGH\nHost: evil.com")).toBe(false);
    expect(isValidEventId("ABCDEFGH\n")).toBe(false);
    expect(isValidEventId("")).toBe(false);
    expect(isValidEventId("ABCDEFG")).toBe(false);
    expect(isValidEventId("ABCDEFGHI")).toBe(false);
  });
});
