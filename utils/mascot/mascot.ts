import { hashString } from "../arrangerColor";
import definition from "./pixelbot.json";

export interface MascotElement {
  name: string;
  attributes: Record<string, string>;
  children: MascotElement[];
}

export interface Mascot {
  width: number;
  height: number;
  panel: string;
  elements: MascotElement[];
}

/* $primary-color-600 (#4D21F7) is hsl(252 93% 55%). The panel keeps its hue but
   drops the lightness, because the per-user glow only reads against a dark
   plate, the way the artwork's own near-black palette intends. */
const PEOPLY_PANEL = "hsl(252 60% 12%)";

const GLOW_SATURATION_PERCENT = 85;
const GLOW_LIGHTNESS_PERCENT = 72;

type DefinitionNode = {
  name: string;
  type: "element" | "component";
  attributes?: Record<string, unknown>;
  children?: DefinitionNode[];
};

type Palette = Record<string, string>;

function glowFor(seed: string) {
  return `hsl(${hashString(`${seed}:glow`) % 360} ${GLOW_SATURATION_PERCENT}% ${GLOW_LIGHTNESS_PERCENT}%)`;
}

function chooseVariant(seed: string, componentName: string, names: string[]) {
  return names[hashString(`${seed}:${componentName}`) % names.length];
}

function resolveAttributes(
  attributes: Record<string, unknown> | undefined,
  palette: Palette,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(attributes ?? {}).map(([name, value]) => {
      if (
        value !== null &&
        typeof value === "object" &&
        (value as { type?: string }).type === "color"
      ) {
        const colorName = (value as { name: string }).name;
        return [name, palette[colorName] ?? PEOPLY_PANEL];
      }
      return [name, String(value)];
    }),
  );
}

function resolveNodes(
  nodes: DefinitionNode[],
  seed: string,
  palette: Palette,
): MascotElement[] {
  return nodes.map((node) => resolveNode(node, seed, palette));
}

function resolveNode(
  node: DefinitionNode,
  seed: string,
  palette: Palette,
): MascotElement {
  const attributes = resolveAttributes(node.attributes, palette);

  if (node.type === "component") {
    const component = components[node.name];
    const variantNames = Object.keys(component.variants);
    const variant =
      component.variants[chooseVariant(seed, node.name, variantNames)];

    return {
      name: "g",
      attributes,
      children: resolveNodes(variant.elements, seed, palette),
    };
  }

  return {
    name: node.name,
    attributes,
    children: resolveNodes(node.children ?? [], seed, palette),
  };
}

const components = definition.components as unknown as Record<
  string,
  { variants: Record<string, { elements: DefinitionNode[] }> }
>;

export function getMascot(seed: string): Mascot {
  const palette: Palette = { background: PEOPLY_PANEL, glow: glowFor(seed) };
  const canvas = definition.canvas as unknown as {
    width: number;
    height: number;
    elements: DefinitionNode[];
  };

  return {
    width: canvas.width,
    height: canvas.height,
    panel: PEOPLY_PANEL,
    elements: resolveNodes(canvas.elements, seed, palette),
  };
}
