import React from "react";
import { describe, expect, it } from "vitest";

import {
  allEventInputsValid,
  arrayFromRange,
  calculateEditDistance,
  categoryInputValid,
  getInputPageData,
  getISODate,
  groupBy,
  imageInputValid,
  injectLink,
  isValidEmail,
  laterThan,
  numberInputValid,
  olderThanToday,
  radioInputValid,
  removeTimezone,
  addTimezone,
  textInputValid,
} from "../utils/functions";

describe("textInputValid", () => {
  it("uses min exclusive and max inclusive", () => {
    expect(textInputValid("ab", 1, 3)).toBe(true);
    expect(textInputValid("a", 1, 3)).toBe(false);
    expect(textInputValid("abcd", 1, 3)).toBe(false);
  });
});

describe("numberInputValid", () => {
  it("uses min exclusive and max inclusive", () => {
    expect(numberInputValid(2, 1, 5)).toBe(true);
    expect(numberInputValid(1, 1, 5)).toBe(false);
    expect(numberInputValid(6, 1, 5)).toBe(false);
  });
});

describe("arrayFromRange", () => {
  it("returns zero-based indices", () => {
    expect(arrayFromRange(3)).toEqual([0, 1, 2]);
    expect(arrayFromRange(0)).toEqual([]);
  });
});

describe("getInputPageData", () => {
  it("returns the first page for step zero and unknown steps", () => {
    expect(getInputPageData(0).title).toBe("Opprett nytt arrangement");
    expect(getInputPageData(99).title).toBe("Opprett nytt arrangement");
  });

  it("returns the summary page for step six", () => {
    expect(getInputPageData(6).title).toBe("Ditt arrangement");
    expect(getInputPageData(6).buttonText).toBe("Opprett arrangement");
  });
});

describe("input validation helpers", () => {
  it("requires at least one category", () => {
    expect(categoryInputValid([1])).toBe(true);
    expect(categoryInputValid([])).toBe(false);
  });

  it("respects whether the radio number is required", () => {
    expect(radioInputValid(false, 0, 1, 5)).toBe(true);
    expect(radioInputValid(true, 1, 1, 5)).toBe(false);
    expect(radioInputValid(true, 2, 1, 5)).toBe(true);
  });

  it("requires an image file", () => {
    expect(imageInputValid(new File([""], "x"))).toBe(true);
    expect(imageInputValid(null)).toBe(false);
  });

  it("requires every event input to be valid", () => {
    expect(allEventInputsValid([true, true])).toBe(true);
    expect(allEventInputsValid([true, false])).toBe(false);
    expect(allEventInputsValid([])).toBe(true);
  });
});

describe("date and time helpers", () => {
  it("formats an ISO date from a UTC date", () => {
    expect(getISODate(new Date("2026-08-06T12:00:00Z"))).toBe("2026-08-06");
  });

  it("round-trips addTimezone and removeTimezone", () => {
    const input = "2026-08-06T12:00:00.000Z";
    expect(removeTimezone(addTimezone(input))).toBe(input);
  });

  it("treats today as valid and yesterday as not valid", () => {
    expect(olderThanToday(new Date())).toBe(true);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(olderThanToday(yesterday)).toBe(false);
  });

  it("returns true when either laterThan argument is missing", () => {
    expect(laterThan(undefined, "2026-08-06T12:00:00Z")).toBe(true);
    expect(laterThan("2026-08-06T12:00:00Z")).toBe(true);
  });
});

describe("groupBy", () => {
  it("groups preserving first-seen key order", () => {
    const result = groupBy(
      [
        { type: "a", id: 1 },
        { type: "b", id: 2 },
        { type: "a", id: 3 },
      ],
      (item) => item.type,
    );
    expect(result).toEqual([
      {
        key: "a",
        values: [
          { type: "a", id: 1 },
          { type: "a", id: 3 },
        ],
      },
      { key: "b", values: [{ type: "b", id: 2 }] },
    ]);
  });
});

describe("calculateEditDistance", () => {
  it("computes Levenshtein distances", () => {
    expect(calculateEditDistance("", "")).toBe(0);
    expect(calculateEditDistance("abc", "abc")).toBe(0);
    expect(calculateEditDistance("abc", "ab")).toBe(1);
    expect(calculateEditDistance("ab", "abc")).toBe(1);
    expect(calculateEditDistance("kitten", "sitting")).toBe(3);
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails and rejects invalid ones", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("injectLink", () => {
  it("turns a URL into a link element and keeps other text", () => {
    const result = injectLink("Se https://example.com nå");
    const link = result[1];
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("Se ");
    if (!React.isValidElement(link)) {
      throw new Error("expected a link element");
    }
    expect(link.props.href).toBe("https://example.com");
    expect(result[2]).toBe(" nå");
  });
});
