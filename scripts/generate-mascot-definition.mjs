import { writeFileSync } from "node:fs";

const STYLE = "pixelbot";
const DICEBEAR_MAJOR = "10.x";
const OUTPUT = new URL("../utils/mascot/pixelbot.json", import.meta.url);

const UNUSED_COMPONENTS = ["animation"];

function stripInertAttributes(node) {
  if (Array.isArray(node)) {
    for (const child of node) stripInertAttributes(child);
    return;
  }
  if (node === null || typeof node !== "object") return;

  if (node.attributes && typeof node.attributes === "object") {
    delete node.attributes.class;
  }
  for (const value of Object.values(node)) stripInertAttributes(value);
}

const response = await fetch(
  `https://api.dicebear.com/${DICEBEAR_MAJOR}/${STYLE}/definition.json`,
);
if (!response.ok) {
  throw new Error(`DiceBear answered ${response.status} for ${STYLE}`);
}
const upstream = await response.json();

const definition = {
  $provenance: {
    style: upstream.meta.source.name,
    source: upstream.$id,
    license: upstream.meta.license.name,
    attribution: upstream.meta.license.text,
    creator: upstream.meta.creator.name,
  },
  canvas: {
    ...upstream.canvas,
    elements: upstream.canvas.elements.filter(
      (element) => !UNUSED_COMPONENTS.includes(element.name),
    ),
  },
  components: Object.fromEntries(
    Object.entries(upstream.components).filter(
      ([name]) => !UNUSED_COMPONENTS.includes(name),
    ),
  ),
};

stripInertAttributes(definition.components);
stripInertAttributes(definition.canvas);

writeFileSync(OUTPUT, `${JSON.stringify(definition, null, 2)}\n`);

const bytes = JSON.stringify(definition).length;
process.stdout.write(
  `wrote ${OUTPUT.pathname} (${Math.round(bytes / 1024)} KB, ${definition.$provenance.license})\n`,
);
