export interface ArrangerColor {
  accent: string;
  background: string;
}

export interface ArrangerPalette {
  primary: string;
  accent: string | null;
}

interface Hsl {
  hue: number;
  saturation: number;
  lightness: number;
}

const READABLE_LIGHTNESS_RANGE = { min: 0.4, max: 0.62 };
const EVENT_BACKGROUND_ALPHA = 0.16;
const HASHED_FALLBACK_SATURATION = 0.6;
const HASHED_FALLBACK_LIGHTNESS = 0.5;

export function hashString(value: string): number {
  let hash = 5381;
  for (let index = 0; index < value.length; index++) {
    hash = (Math.imul(hash, 33) ^ value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function toRgb(hexColor: string) {
  const digits = hexColor.replace("#", "");
  return [
    Number.parseInt(digits.slice(0, 2), 16),
    Number.parseInt(digits.slice(2, 4), 16),
    Number.parseInt(digits.slice(4, 6), 16),
  ] as const;
}

function toHsl(hexColor: string): Hsl {
  const [red, green, blue] = toRgb(hexColor).map((channel) => channel / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const span = max - min;
  const lightness = (max + min) / 2;

  if (span === 0) return { hue: 0, saturation: 0, lightness };

  const saturation = span / (1 - Math.abs(2 * lightness - 1));

  if (max === red) {
    return {
      hue: ((green - blue) / span + (green < blue ? 6 : 0)) * 60,
      saturation,
      lightness,
    };
  }
  if (max === green) {
    return { hue: ((blue - red) / span + 2) * 60, saturation, lightness };
  }
  return { hue: ((red - green) / span + 4) * 60, saturation, lightness };
}

function formatHsl({ hue, saturation, lightness }: Hsl, alpha = 1) {
  const channels = `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
  return alpha === 1
    ? `hsl(${channels})`
    : `hsl(${channels} / ${Math.round(alpha * 100)}%)`;
}

function isSixDigitHex(color: string | null): color is string {
  return color !== null && /^#[0-9a-fA-F]{6}$/.test(color);
}

function withAlpha(hexColor: string, alpha: number) {
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hexColor}${channel}`;
}

function readsOnBothThemes(color: Hsl) {
  return (
    color.lightness >= READABLE_LIGHTNESS_RANGE.min &&
    color.lightness <= READABLE_LIGHTNESS_RANGE.max
  );
}

function intoReadableBand(color: Hsl): Hsl {
  const { min, max } = READABLE_LIGHTNESS_RANGE;
  return {
    ...color,
    lightness: color.lightness < min ? min : max,
  };
}

export function toArrangerColor(
  palette: ArrangerPalette,
  fallbackKey: string,
): ArrangerColor {
  if (!isSixDigitHex(palette.primary)) return getArrangerColor(fallbackKey);

  const accentSource = isSixDigitHex(palette.accent)
    ? palette.accent
    : palette.primary;
  const accent = toHsl(accentSource);

  return {
    accent: readsOnBothThemes(accent)
      ? accentSource
      : formatHsl(intoReadableBand(accent)),
    background: withAlpha(palette.primary, EVENT_BACKGROUND_ALPHA),
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
