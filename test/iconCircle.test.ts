import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const STYLES_DIRECTORY = join(process.cwd(), "styles");

const IS_A_BADGE_NOT_AN_ICON_CIRCLE = ["SmallCheckCircle.module.scss"];

describe("icon circle", () => {
  it("is drawn by one stylesheet, so a new circle cannot quietly fork the shape", () => {
    const forks = readdirSync(STYLES_DIRECTORY)
      .filter((file) => file.endsWith(".module.scss"))
      .filter((file) => !IS_A_BADGE_NOT_AN_ICON_CIRCLE.includes(file))
      .filter((file) =>
        readFileSync(join(STYLES_DIRECTORY, file), "utf8").includes(
          "iconCircle()",
        ),
      );

    expect(forks).toEqual(["IconCircle.module.scss"]);
  });
});
