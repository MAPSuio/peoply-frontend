import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Snackbar from "../components/Snackbar";
import styles from "../styles/Snackbar.module.scss";
import { SnackTypes } from "../types/types";

function classesOf(props: { type?: SnackTypes; first?: boolean }) {
  const { container } = render(<Snackbar label="Lagret" {...props} />);
  const snack = container.firstElementChild;
  if (!snack) throw new Error("Snackbar rendered nothing");

  return Array.from(snack.classList).sort();
}

function expected(...names: Array<keyof typeof styles>) {
  return names.map((name) => styles[name]).sort();
}

function iconClassesOf(props: { type?: SnackTypes; first?: boolean }) {
  const { container } = render(<Snackbar label="Lagret" {...props} />);
  const icon = container.querySelector("svg");

  return icon ? Array.from(icon.classList).sort() : null;
}

describe("Snackbar", () => {
  it.each([
    [
      { type: SnackTypes.SUCCESS, first: true },
      ["container", "success", "successShadow", "animation"],
    ],
    [{ type: SnackTypes.SUCCESS }, ["container", "success"]],
    [
      { type: SnackTypes.WARNING, first: true },
      ["container", "warning", "warningShadow", "animation"],
    ],
    [{ type: SnackTypes.WARNING }, ["container", "warning"]],
    [
      { type: SnackTypes.ERROR, first: true },
      ["container", "error", "errorShadow", "animation"],
    ],
    [{ type: SnackTypes.ERROR }, ["container", "error"]],
    [{ first: true }, ["container", "shadow", "animation"]],
    [{}, ["container", "animation"]],
  ] as Array<[{ type?: SnackTypes; first?: boolean }, string[]]>)(
    "dresses %o in %o",
    (props, names) => {
      expect(classesOf(props)).toEqual(expected(...names));
    },
  );

  it.each([
    [SnackTypes.SUCCESS, ["icon", "successIcon"]],
    [SnackTypes.WARNING, ["icon", "successIcon"]],
    [SnackTypes.ERROR, ["icon", "errorIcon"]],
  ] as Array<[SnackTypes, string[]]>)("gives %o the %o icon", (type, names) => {
    expect(iconClassesOf({ type })).toEqual(expected(...names));
  });

  it("shows no icon when it carries no type", () => {
    expect(iconClassesOf({})).toBeNull();
  });
});
