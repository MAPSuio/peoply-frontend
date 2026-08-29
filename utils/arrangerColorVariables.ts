import type { CSSProperties } from "react";

import {
  type ArrangerColor,
  arrangerAccentVariable,
  arrangerBackgroundVariable,
} from "./arrangerColor";

export function toArrangerColorVariables(
  colorsByKey: Record<string, ArrangerColor>,
): CSSProperties {
  const variables: Record<string, string> = {};

  for (const [key, colors] of Object.entries(colorsByKey)) {
    variables[arrangerAccentVariable(key)] = colors.accent;
    variables[arrangerBackgroundVariable(key)] = colors.background;
  }

  return variables as CSSProperties;
}
