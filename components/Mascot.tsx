import { type ReactElement, createElement } from "react";

import { type MascotElement, getMascot } from "../utils/mascot/mascot";

interface MascotProps {
  seed: string;
  className?: string;
}

function toReactAttributes(attributes: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(attributes).map(([name, value]) => [
      name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()),
      value,
    ]),
  );
}

function toReactElement(element: MascotElement, key: number): ReactElement {
  return createElement(
    element.name,
    { key, ...toReactAttributes(element.attributes) },
    element.children.length > 0
      ? element.children.map(toReactElement)
      : undefined,
  );
}

const Mascot = ({ seed, className }: MascotProps) => {
  const { width, height, panel, elements } = getMascot(seed);

  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      fill="none"
      shapeRendering="auto"
    >
      <rect width={width} height={height} fill={panel} />
      {elements.map(toReactElement)}
    </svg>
  );
};

export default Mascot;
