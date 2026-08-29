export interface ArrangerColor {
  accent: string;
  background: string;
}

export interface ArrangerPalette {
  primary: string;
  secondary: string;
}

export interface Hsl {
  hue: number;
  saturation: number;
  lightness: number;
}

const READABLE_SATURATION_RANGE = { min: 0.35, max: 0.85 };
const READABLE_LIGHTNESS_RANGE = { min: 0.4, max: 0.62 };
const DISTINCT_HUE_DEGREES = 30;
const EVENT_BACKGROUND_ALPHA = 0.16;
const HASHED_FALLBACK_SATURATION = 0.6;
const HASHED_FALLBACK_LIGHTNESS = 0.5;

const COLOR_LEVELS_PER_CHANNEL = 16;
const COLOR_BUCKET_SIZE = 256 / COLOR_LEVELS_PER_CHANNEL;
const OPAQUE_ENOUGH_ALPHA = 128;

const BACKDROP_LIGHTNESS_ABOVE = 0.92;
const BACKDROP_LIGHTNESS_BELOW = 0.08;
const BACKDROP_SATURATION_BELOW = 0.12;

function hashString(value: string): number {
  let hash = 5381;
  for (let index = 0; index < value.length; index++) {
    hash = (Math.imul(hash, 33) ^ value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function clamp(value: number, { min, max }: { min: number; max: number }) {
  return Math.min(max, Math.max(min, value));
}

export function hueDistance(first: number, second: number) {
  const difference = Math.abs(first - second) % 360;
  return difference > 180 ? 360 - difference : difference;
}

function rgbToHsl(red: number, green: number, blue: number): Hsl {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const span = max - min;
  const lightness = (max + min) / 2;

  if (span === 0) {
    return { hue: 0, saturation: 0, lightness };
  }

  const saturation = span / (1 - Math.abs(2 * lightness - 1));

  if (max === r) {
    return {
      hue: ((g - b) / span + (g < b ? 6 : 0)) * 60,
      saturation,
      lightness,
    };
  }
  if (max === g) {
    return { hue: ((b - r) / span + 2) * 60, saturation, lightness };
  }
  return { hue: ((r - g) / span + 4) * 60, saturation, lightness };
}

function asPercentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatHsl({ hue, saturation, lightness }: Hsl, alpha = 1) {
  const channels = `${Math.round(hue)} ${asPercentage(saturation)} ${asPercentage(lightness)}`;
  return alpha === 1
    ? `hsl(${channels})`
    : `hsl(${channels} / ${asPercentage(alpha)})`;
}

export function toHsl(color: string): Hsl {
  const [hue, saturation, lightness] = color
    .replace(/^hsl\(|\)$|%/g, "")
    .split(/[\s/]+/)
    .filter(Boolean)
    .map(Number);

  return {
    hue: hue ?? 0,
    saturation: (saturation ?? 0) / 100,
    lightness: (lightness ?? 0) / 100,
  };
}

function toReadableOnBothThemes(color: Hsl): Hsl {
  return {
    hue: color.hue,
    saturation: clamp(color.saturation, READABLE_SATURATION_RANGE),
    lightness: clamp(color.lightness, READABLE_LIGHTNESS_RANGE),
  };
}

function isBackdropRatherThanBrand({ saturation, lightness }: Hsl) {
  return (
    lightness > BACKDROP_LIGHTNESS_ABOVE ||
    lightness < BACKDROP_LIGHTNESS_BELOW ||
    saturation < BACKDROP_SATURATION_BELOW
  );
}

interface ColorBucket {
  index: number;
  pixelCount: number;
  redSum: number;
  greenSum: number;
  blueSum: number;
}

function bucketIndexOf(red: number, green: number, blue: number) {
  return (
    Math.floor(red / COLOR_BUCKET_SIZE) *
      COLOR_LEVELS_PER_CHANNEL *
      COLOR_LEVELS_PER_CHANNEL +
    Math.floor(green / COLOR_BUCKET_SIZE) * COLOR_LEVELS_PER_CHANNEL +
    Math.floor(blue / COLOR_BUCKET_SIZE)
  );
}

function countPixelsPerColorBucket(pixels: Uint8ClampedArray) {
  const buckets = new Map<number, ColorBucket>();

  for (let offset = 0; offset + 3 < pixels.length; offset += 4) {
    if (pixels[offset + 3] < OPAQUE_ENOUGH_ALPHA) continue;

    const red = pixels[offset];
    const green = pixels[offset + 1];
    const blue = pixels[offset + 2];
    const index = bucketIndexOf(red, green, blue);
    const bucket = buckets.get(index) ?? {
      index,
      pixelCount: 0,
      redSum: 0,
      greenSum: 0,
      blueSum: 0,
    };

    bucket.pixelCount += 1;
    bucket.redSum += red;
    bucket.greenSum += green;
    bucket.blueSum += blue;
    buckets.set(index, bucket);
  }

  return [...buckets.values()];
}

function byPixelCountThenBucketIndex(first: ColorBucket, second: ColorBucket) {
  return second.pixelCount - first.pixelCount || first.index - second.index;
}

function averageColorOf(bucket: ColorBucket): Hsl {
  return rgbToHsl(
    bucket.redSum / bucket.pixelCount,
    bucket.greenSum / bucket.pixelCount,
    bucket.blueSum / bucket.pixelCount,
  );
}

function atFarthestReadableLightness(readableColor: Hsl): Hsl {
  const { min, max } = READABLE_LIGHTNESS_RANGE;
  const roomToLighten = max - readableColor.lightness;
  const roomToDarken = readableColor.lightness - min;

  return {
    ...readableColor,
    lightness: roomToLighten >= roomToDarken ? max : min,
  };
}

export function getPaletteFromPixels(
  pixels: Uint8ClampedArray,
): ArrangerPalette | undefined {
  const buckets = countPixelsPerColorBucket(pixels).sort(
    byPixelCountThenBucketIndex,
  );
  if (buckets.length === 0) return undefined;

  const brandBuckets = buckets.filter(
    (bucket) => !isBackdropRatherThanBrand(averageColorOf(bucket)),
  );
  const ranked = brandBuckets.length > 0 ? brandBuckets : buckets;

  const primary = averageColorOf(ranked[0]);
  const distinctlyDifferent = ranked
    .slice(1)
    .find(
      (bucket) =>
        hueDistance(averageColorOf(bucket).hue, primary.hue) >=
        DISTINCT_HUE_DEGREES,
    );

  const readablePrimary = toReadableOnBothThemes(primary);
  const readableSecondary = distinctlyDifferent
    ? toReadableOnBothThemes(averageColorOf(distinctlyDifferent))
    : atFarthestReadableLightness(readablePrimary);

  return {
    primary: formatHsl(readablePrimary),
    secondary: formatHsl(readableSecondary),
  };
}

export function toArrangerColor(palette: ArrangerPalette): ArrangerColor {
  return {
    accent: palette.secondary,
    background: formatHsl(toHsl(palette.primary), EVENT_BACKGROUND_ALPHA),
  };
}

export function toArrangerColorKey(key: string) {
  return key.replace(
    /[^a-zA-Z0-9]/g,
    (character) => `-${character.charCodeAt(0)}-`,
  );
}

export function arrangerAccentVariable(key: string) {
  return `--arranger-accent-${key}`;
}

export function arrangerBackgroundVariable(key: string) {
  return `--arranger-wash-${key}`;
}

export function getArrangerColor(key: string): ArrangerColor {
  const hashedHue: Hsl = {
    hue: hashString(key) % 360,
    saturation: HASHED_FALLBACK_SATURATION,
    lightness: HASHED_FALLBACK_LIGHTNESS,
  };

  return {
    accent: formatHsl(hashedHue),
    background: formatHsl(hashedHue, EVENT_BACKGROUND_ALPHA),
  };
}
