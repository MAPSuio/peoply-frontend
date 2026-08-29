import { type CSSProperties, useMemo } from "react";

import {
  arrangerAccentVariable,
  arrangerBackgroundVariable,
} from "../utils/arrangerColor";
import useArrangerPalettes, {
  type ArrangerImageSource,
} from "./useArrangerPalettes";

export default function useArrangerColorVariables(
  sources: ArrangerImageSource[],
): CSSProperties {
  const colorsByKey = useArrangerPalettes(sources);

  return useMemo(() => {
    const variables: Record<string, string> = {};

    for (const [key, colors] of Object.entries(colorsByKey)) {
      variables[arrangerAccentVariable(key)] = colors.accent;
      variables[arrangerBackgroundVariable(key)] = colors.background;
    }

    return variables as CSSProperties;
  }, [colorsByKey]);
}
