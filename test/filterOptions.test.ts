import { describe, expect, it } from "vitest";

import {
  matchingOptions,
  normalizeSearchValue,
  sortedUniqueOptions,
} from "../utils/filterOptions";

describe("sortedUniqueOptions", () => {
  it("puts the options in the order a Norwegian reader expects", () => {
    const sorted = sortedUniqueOptions([
      { value: 3, label: "Åpen scene" },
      { value: 1, label: "Bedpres" },
      { value: 2, label: "Åre" },
    ]);

    expect(sorted.map(({ label }) => label)).toEqual([
      "Bedpres",
      "Åpen scene",
      "Åre",
    ]);
  });

  it("lists an option once when the same organizer arrives twice", () => {
    const sorted = sortedUniqueOptions([
      { value: "maps", label: "MAPS" },
      { value: "maps", label: "MAPS" },
      { value: "cyb", label: "CYB" },
    ]);

    expect(sorted).toEqual([
      { value: "cyb", label: "CYB" },
      { value: "maps", label: "MAPS" },
    ]);
  });
});

describe("matchingOptions", () => {
  const options = [
    { value: 1, label: "Bedriftspresentasjon" },
    { value: 2, label: "Åre" },
    { value: 3, label: "Fest" },
  ];

  it("keeps every option when nothing is typed", () => {
    expect(matchingOptions(options, "   ")).toEqual(options);
  });

  it("matches on a fragment from the middle of the label", () => {
    expect(matchingOptions(options, "presentasjon")).toEqual([options[0]]);
  });

  it("finds a Norwegian label typed without its accents", () => {
    expect(matchingOptions(options, "are")).toEqual([options[1]]);
  });

  it("ignores case and surrounding spaces", () => {
    expect(matchingOptions(options, "  FEST ")).toEqual([options[2]]);
  });
});

describe("normalizeSearchValue", () => {
  it("strips the accents that separate a typed term from its label", () => {
    expect(normalizeSearchValue("  ÅRSFEST på Blindern ")).toBe(
      "arsfest pa blindern",
    );
  });
});
