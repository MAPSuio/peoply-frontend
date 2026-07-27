// Deterministic accent colors for calendar entries, derived from a hash of
// the arranger's id. The same organization always gets the same hue without
// any stored mapping, and different organizations land on different hues.
// The accent uses fixed saturation/lightness and the background is the same
// hue at low alpha, so both stay readable on light and dark themes.

export interface ArrangerColor {
  accent: string;
  background: string;
}

// djb2 xor variant — stable across sessions, good enough spread for hues.
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(hash, 33) ^ value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getArrangerColor(key: string): ArrangerColor {
  const hue = hashString(key) % 360;
  return {
    accent: `hsl(${hue} 60% 50%)`,
    background: `hsl(${hue} 60% 50% / 16%)`,
  };
}
