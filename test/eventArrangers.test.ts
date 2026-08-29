import { describe, expect, it } from "vitest";

import type { Event } from "../types/types";
import { getCompactEventArrangerLabel } from "../utils/eventArrangers";

function eventArrangedBy(...names: string[]) {
  return {
    eventArrangers: names.map((name, index) => ({
      arrangerId: `arranger-${index}`,
      arranger: {
        id: `arranger-${index}`,
        organization: { id: `org-${index}`, name },
      },
    })),
  } as unknown as Event;
}

describe("getCompactEventArrangerLabel", () => {
  it("names the arranger when there is only one", () => {
    expect(getCompactEventArrangerLabel(eventArrangedBy("MAPS"))).toBe("MAPS");
  });

  it("says what the hidden arrangers are, not just how many", () => {
    expect(getCompactEventArrangerLabel(eventArrangedBy("MAPS", "Mikro"))).toBe(
      "MAPS og 1 annen arrangør",
    );
  });

  it("counts several hidden arrangers in the plural", () => {
    expect(
      getCompactEventArrangerLabel(eventArrangedBy("MAPS", "Mikro", "Digitus")),
    ).toBe("MAPS og 2 andre arrangører");
  });

  it("shows as many arrangers as the caller asks for before counting the rest", () => {
    expect(
      getCompactEventArrangerLabel(
        eventArrangedBy("MAPS", "Mikro", "Digitus"),
        2,
      ),
    ).toBe("MAPS · Mikro og 1 annen arrangør");
  });

  it("falls back to Peoply when nobody is listed", () => {
    expect(getCompactEventArrangerLabel(eventArrangedBy())).toBe("Peoply");
  });
});
