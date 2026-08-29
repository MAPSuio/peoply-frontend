import { useEffect, useMemo, useState } from "react";

import {
  type ArrangerColor,
  getArrangerColor,
  getPaletteFromPixels,
  toArrangerColor,
} from "../utils/arrangerColor";
import { loadImagePixels } from "../utils/imagePixels";

export interface ArrangerImageSource {
  key: string;
  imageUrl?: string;
}

export type PixelLoader = (imageUrl: string) => Promise<Uint8ClampedArray>;

const colorsByImageUrl = new Map<string, Promise<ArrangerColor | undefined>>();

function readColorsFromImage(imageUrl: string, loadPixels: PixelLoader) {
  const alreadyRead = colorsByImageUrl.get(imageUrl);
  if (alreadyRead) return alreadyRead;

  const reading = loadPixels(imageUrl)
    .then((pixels) => {
      const palette = getPaletteFromPixels(pixels);
      return palette ? toArrangerColor(palette) : undefined;
    })
    .catch(() => undefined);

  colorsByImageUrl.set(imageUrl, reading);
  return reading;
}

function hasImage(
  source: ArrangerImageSource,
): source is Required<ArrangerImageSource> {
  return Boolean(source.imageUrl);
}

export default function useArrangerPalettes(
  sources: ArrangerImageSource[],
  loadPixels: PixelLoader = loadImagePixels,
): Record<string, ArrangerColor> {
  const [colorsFromPictures, setColorsFromPictures] = useState<
    Record<string, ArrangerColor>
  >({});

  useEffect(() => {
    let stillMounted = true;

    for (const source of sources.filter(hasImage)) {
      readColorsFromImage(source.imageUrl, loadPixels).then((colors) => {
        if (!colors || !stillMounted) return;

        setColorsFromPictures((previous) =>
          previous[source.key] === colors
            ? previous
            : { ...previous, [source.key]: colors },
        );
      });
    }

    return () => {
      stillMounted = false;
    };
  }, [sources, loadPixels]);

  return useMemo(() => {
    const colorsByKey: Record<string, ArrangerColor> = {};

    for (const { key } of sources) {
      colorsByKey[key] = colorsFromPictures[key] ?? getArrangerColor(key);
    }

    return colorsByKey;
  }, [sources, colorsFromPictures]);
}
